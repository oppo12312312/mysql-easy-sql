/*
 * @Description:
 * @Author: zhongshuai
 * @LastEditors: zhongshuai
 * @Date: 2019-02-20 16:37:13
 * @LastEditTime: 2019-05-24 16:29:36
 */

'use strict';
const example = {
  // 必须传入字段
  tableName: 'teTest',
  // where 可以不传
  // where 传入的字段必须是tableName中存在的字段，否则报错提示
  // where 传入的sql关键字只能是 ['=', '>', '>=', '<', '<=', 'between', 'not between', 'like', 'is' , 'in'],否则会报错
  where: {
    // 时间格式请转化成unix时间戳，不支持其他格式
    dateTime: {
      '>': 153073468,
      '<=': 15709074831,
      between: [ 153073468, 15709074831 ], // between 和 not between 后面必须是一个length=2的数组， 否则会报错
      'not between': [ 15307346, 1570907483 ],
    },
    // in 有两种模式, 下面的是简写，也可以这样： enum: {in :[1, 11]},
    enum: [ 1, 11 ],
    text: {
      like: '%11%', // 注意like 中的 %、_ 等通配符需要拼接到value中
      '=': '1121',
      is: 'not null', // is 的值只能是 not null 和  null
      in: [ '1121' ],
    },
    // = 也有两种模式，下面的是简写，也可以这样：id: {"=" , 1}
    id: 1,
  },
  // columns 如果不传,则查询表中的所有字段，传入的字段必须是tableName中存在的字段，否则报错
  columns: [ 'enum', 'text', 'dateTime' ],
  // orders 可以不传，传入的字段必须是tableName中存在的字段，否则报错
  orders: { id: 'desc' },
  // page 可以不传，必须是大于0的整数
  pageNum: 1,
  pageSize: 10,
};

example;

const dbInfo = require('./dbInfo');
module.exports = {
  /**
   * 通过字段数组获取查询sql的column
   * @param {String} tableName 别名
   * @param {Array} columns 字段
   * @param {String} otherName 别名
   * @return {String}  拼接的sql
   */
  getSqlColumnQuery(tableName, columns, otherName) {
    const arrColumns = [];
    const lintTableName = this.toLine(tableName);
    columns.forEach(att => {
      const lintColumn = this.toLine(att);
      const dbName = dbInfo.getColumn(lintTableName, lintColumn);
      const dbType = dbInfo.getColumnType(lintTableName, lintColumn);
      const types = dbInfo.dbDataTypes;
      let col = `${otherName}.\`${dbName}\``;
      for (const key in types.dateTimeFormat) {
        if (dbType === key) {
          if (types.timeType === 'string') {
            col = `date_format(${col}, ${types.dateTimeFormat[key]})`;
          } else {
            col = `unix_timestamp(${col})`;
          }
        }
      }
      arrColumns.push(`${col} ${att}`);
    });
    return arrColumns.join(' ,');
  },
  getSqlColumnInset(tableName, columns) {
    const arrColumns = [];
    const lintTableName = this.toLine(tableName);
    columns.forEach(att => {
      const lintColumn = this.toLine(att);
      const dbName = dbInfo.getColumn(lintTableName, lintColumn);
      const col = `\`${dbName}\``;
      arrColumns.push(col);
    });
    return arrColumns.join(' ,');
  },
  /**
   * 通过where对象获取whereSql查询语句
   * @param {Object} where wehre object
   * @param {String} otherName 表别名
   * @param {String} tableName 表名称
   * @return {String} wheresql
   */
  getSqlWhere(where, otherName, tableName = '') {
    const wheres = [];
    const lintTableName = this.toLine(tableName);
    for (const key in where) {
      const values = where[key];
      const lineColumn = this.toLine(key);
      const dbColumn = dbInfo.getColumn(lintTableName, lineColumn) || lineColumn;
      const type = this.valueType(values);
      const columnSql = `${otherName}.\`${dbColumn}\``;
      const dbType = dbInfo.getColumnType(lintTableName, lineColumn);
      let inValue = '';
      switch (type) {
        case 'number':
          wheres.push(`${columnSql} = ${values}`);
          break;
        case 'string':
          wheres.push(`${columnSql} = '${values}'`);
          break;
        case 'object':
          for (const ckey in values) {
            if (ckey.indexOf('between') > -1) {
              const value0 = this.getSqlValue(values[ckey][0], dbType);
              const value1 = this.getSqlValue(values[ckey][1], dbType);
              wheres.push(`${columnSql}  ${ckey} ${value0} and  ${value1}`);
            } else if (ckey.indexOf('is') > -1) {
              wheres.push(`${columnSql}  ${ckey} ${values[ckey]}`);
            } else if (ckey.indexOf('in') > -1) {
              const ins = [];
              values[ckey].forEach(att => {
                const sqlValue = this.getSqlValue(att, dbType);
                ins.push(sqlValue);
              });
              const sqlValues = ins.join(' , ');
              wheres.push(`${columnSql} ${ckey}  (${sqlValues})`);

            } else {
              const sqlValue = this.getSqlValue(values[ckey], dbType);
              wheres.push(`${columnSql}  ${ckey} ${sqlValue}`);
            }
          }
          break;
        case 'array':
          if (typeof values[0] === 'number') {
            inValue = values.join(' , ');
          } else {
            inValue = "'" + values.join("' , '") + "'";
          }
          wheres.push(`${columnSql}  in (${inValue})`);
          break;
        default:

      }
    }
    return wheres.join(' and ');
  },
  getSqlValue(value, dbType) {
    let result = '';
    result = value;
    const types = dbInfo.dbDataTypes;
    if (types.string.indexOf(dbType) > -1) {
      result = `'${value}'`;
    }
    types.dateTime.forEach(key => {
      if (dbType === key) {
        if (types.timeType === 'string') {
          result = `str_to_date('${value}', ${types.dateTimeFormat[key]})`;
        } else {
          result = `from_unixtime(${value})`;
        }

      }
    });
    return result;

  },
  /**
   * 拼接orders sql
   * @param {String} tableName  tableName
   * @param {Object} orders  orders
   * @param {String} otherName otherName
   * @return {String} 拼接orders sql
   */
  getSqlOrders(tableName, orders, otherName) {
    let sqlOrders = '';
    const sqlOrdersArr = [];
    for (const key in orders) {
      const dbColumn = dbInfo.getColumn(this.toLine(tableName), this.toLine(key));
      sqlOrdersArr.push(`${otherName}.\`${dbColumn}\`  ${orders[key]}`);
    }
    if (sqlOrdersArr.length > 0) {
      sqlOrders = 'order by ' + sqlOrdersArr.join(', ');
    }
    return sqlOrders;
  },
  /**
   * 获取下划线的表名称
   * @param {String} tableName 驼峰法的表名称
   * @param {String} otherName otherName
   * @return {String} 下划线表名称
   */
  getSqlTableName(tableName, otherName) {
    const name = this.toLine(tableName);
    const dbName = dbInfo.getTableName(name);
    const re = otherName ? `\`${dbName}\` ${otherName}` : `\`${dbName}\``;
    return re;
  },
  getSqlSet(data, tableName, otherName) {
    const lintTableName = this.toLine(tableName);
    const setValueArr = [];
    for (const key in data) {
      const lineColumn = this.toLine(key);
      const dbType = dbInfo.getColumnType(lintTableName, lineColumn);
      const dbColumn = dbInfo.getColumn(lintTableName, key);
      const sqlValue = this.getSqlValue(data[key], dbType);
      setValueArr.push(`${otherName}.\`${dbColumn}\` = ${sqlValue}`);
    }
    return setValueArr.join(',');
  },
  getSqlValuesInset(data, tableName) {
    const lintTableName = this.toLine(tableName);
    const setValueArr = [];
    dbInfo.getColumnExist(lintTableName, 'id');
    setValueArr.push('UUID()');
    for (const key in data) {
      const lineColumn = this.toLine(key);
      const dbType = dbInfo.getColumnType(lintTableName, lineColumn);
      const sqlValue = this.getSqlValue(data[key], dbType);
      setValueArr.push(sqlValue);
    }

    return setValueArr.join(',');
  },
  getColumnsByData(data, tableName) {
    const lintTableName = this.toLine(tableName);
    const columns = [];
    if (dbInfo.getColumnExist(lintTableName, 'id')) {
      columns.push('id');
    }
    for (const key in data) {
      columns.push(key);
    }
    return columns;
  },
  /**
   * 下划线转驼峰
   * @param {string} name 下划线字段
   * @return {string} hump
   */
  toHump(name) {
    name = name.toLowerCase();
    return name.replace(/\_(\w)/g, function(all, letter) {
      return letter.toUpperCase();
    });
  },
  /**
   * 驼峰转下划线
   * @param {string} name 驼峰字段
   * @return {string} 下划线字段
   */
  toLine(name) {
    return name.replace(/([A-Z])/g, '_$1').toUpperCase();
  },
  getPage(pageNum, pageSize) {
    const page = (pageNum - 1) * pageSize;
    return `limit ${page} , ${pageSize}`;
  },
  /**
   * 判断值的类型
   * @param {*} value 一个任意类型
   * @return {String} 类型
   */
  valueType(value) {
    let type = typeof value;
    if (type === 'object') {
      if (!isNaN(value.length)) {
        type = 'array';
      }
    }
    return type;
  },
};
