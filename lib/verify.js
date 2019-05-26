/*
 * @Description:
 * @Author: zhongshuai
 * @LastEditors: zhongshuai
 * @Date: 2019-02-22 17:41:54
 * @LastEditTime: 2019-05-24 18:06:22
 */
'use strict';
const verifyType = {
  where: 'object',
  columns: 'array',
  orders: 'object',
  pageNum: 'number',
  pageSize: 'number',
  tableName: 'string',
  updateData: 'object',
  insertData: 'array',
};
const dbInfo = require('./dbInfo');
const base = require('./base');
module.exports = {

  /**
   * select 传入值的校验
   * @param {String} tableName   tableName
   * @param {Object} where   where
   * @param {Array} columns  columns
   * @param {Array} orders  orders
   * @param {Number} pageNum  pageNum
   * @param {Number} pageSize pageSize
   */
  verifySelect(tableName, where, columns, orders, pageNum, pageSize) {
    const all = { tableName, where, columns, orders, pageNum, pageSize };
    this.verifyDataType(all);
    this.verifyTableName(tableName);
    this.verifyWhere(where, tableName);
    this.verifyColumns(tableName, columns);
    this.verifyOrders(tableName, orders);
    this.verifyPage(pageNum, pageSize);
  },
  verifyUpdate(tableName, data, where) {
    const all = { tableName, where, updateData: data };
    this.verifyDataType(all);
    this.verifyTableName(tableName);
    this.verifyWhere(where, tableName);
    this.verifyUpdateData(data, tableName);
  },
  verifyInset(tableName, data, columns) {
    const all = { tableName, columns, updateData: data };
    this.verifyDataType(all);
    this.verifyTableName(tableName);
    this.verifyColumns(tableName, columns);
    this.verifyUpdateData(data, tableName);
  },

  verifyUpdateData(data, tableName) {
    for (const key in data) {
      this.verifyColumn(tableName, key, 'data');
      this.verifyValue(tableName, key, data[key]);
    }
  },
  verifyDataType(value) {
    for (const key in value) {
      if (base.valueType(value[key]) !== verifyType[key]) {
        throw new Error(`${key}字段只能是(${verifyType[key]})类型`);
      }
    }
  },
  /**
   * 校验SelectParam参数
   * @param {Object} param SelectParam
   */
  verifySelectParam(param) {
    if (base.valueType(param) !== 'object') {
      throw new Error('select的param参数必须是一个object');
    }
    if (!param.tableName) {
      throw new Error('select的param中必须包含tableName字段');
    }
  },
  /**
   * 校验SelectParam参数
   * @param {Object} param SelectParam
   */
  verifyUpdateParam(param) {
    if (base.valueType(param) !== 'object') {
      throw new Error('Update的param参数必须是一个object');
    }
    if (!param.tableName) {
      throw new Error('Update的param中必须包含tableName字段');
    }
    if (!param.where) {
      throw new Error('Update的param中必须包含where字段');
    }
    if (!param.data) {
      throw new Error('Update的param中必须包含data字段');
    }
  },
  verifyDeleteParam(param) {
    if (base.valueType(param) !== 'object') {
      throw new Error('Delete的param参数必须是一个object');
    }
    if (!param.tableName) {
      throw new Error('Delete的param中必须包含tableName字段');
    }
    if (!param.id) {
      throw new Error('Delete的param中必须包含id字段');
    }
  },
  /**
   * 校验InsetParam参数
   * @param {Object} param SelectParam
   */
  verifyInsetParam(param) {
    if (base.valueType(param) !== 'object') {
      throw new Error('Inset的param参数必须是一个object');
    }
    if (!param.tableName) {
      throw new Error('Inset的param中必须包含tableName字段');
    }
    if (!param.data) {
      throw new Error('Inset的param中必须包含data字段');
    }
  },
  verifyColumns(tableName, columns) {
    console.log(columns);
    columns.forEach(attr => {
      this.verifyColumn(tableName, attr, 'columns');
    });
  },
  /**
   * where 传入值的校验
   * @param {Object} where   where
   * @param {String} tableName   tableName
   */
  verifyWhere(where, tableName = '') {
    for (const key in where) {
      const lineKey = base.toLine(key);
      const sqlKeysStr = dbInfo.sqlKeys.join(',');

      if ([ 'string', 'number', 'object', 'array' ].indexOf(base.valueType(where[key])) < 0) {
        throw new Error(`where.${key}(${lineKey}) 是无法使用的数据类型`);
      }
      if (tableName) {
        this.verifyColumn(tableName, key, 'where');
        if ([ 'string', 'number' ].indexOf(base.valueType(where[key])) > -1) {
          this.verifyValue(tableName, key, where[key]);
        }
      }

      if (base.valueType(where[key]) === 'object') {
        for (const sqlKey in where[key]) {
          const lowerKeys = sqlKey.toLowerCase();
          const value = where[key][sqlKey];
          const info = `where.${key}[${sqlKey}]`;
          if (dbInfo.sqlKeys.indexOf(lowerKeys) < 0) {
            throw new Error(`${info} 是无法使用的sql关键字, 请在以下关键字中选择： ${sqlKeysStr}`);
          }
          if (sqlKey.toLowerCase() === 'is' && value.toLowerCase() !== 'null' && value.toLowerCase() !== 'not null') {
            throw new Error(`${info} 只能是null或则not null`);
          }
          if (sqlKey.toLowerCase().indexOf('between') > -1) {
            if (base.valueType(value) !== 'array' || value.length !== 2) {
              throw new Error(`${info} 只能是一个长度为2的array`);
            }
          }
        }
      }
    }
  },
  /**
   * orders 传入值的校验
   * @param {String} tableName   tableName
   * @param {Object} orders   orders
   */
  verifyOrders(tableName, orders) {
    for (const key in orders) {
      this.verifyColumn(tableName, key, 'orders');
      if (dbInfo.descAsc.indexOf(orders[key]) < 0) {
        throw new Error(`orders中的 ${key}.attr[key] 不是desc asc`);
      }
    }
  },
  /**
   * column 传入值的校验
   * @param {String} tableName   tableName
   * @param {Object} column   column
   * @param {Object} type   type
   */
  verifyColumn(tableName, column, type) {
    const lineTableName = base.toLine(tableName);
    const lineKey = base.toLine(column);
    if (!dbInfo.getColumnExist(lineTableName, lineKey)) {
      throw new Error(`${type}中的 ${column}(${lineKey}) 在表 ${tableName}(${lineTableName}) 中不存在`);
    }
  },
  /**
   * tableName 传入值的校验
   * @param {String} tableName   tableName
   */
  verifyTableName(tableName) {
    const lineTableName = base.toLine(tableName);
    if (!dbInfo.getTableNameExist(lineTableName)) {
      throw new Error(`${tableName}( ${lineTableName} ) :数据库中找不到这张表 `);
    }
  },
  /**
   * 校验 pageNum，pageSize
   * @param {number} pageNum  大于0
   * @param {number} pageSize  大于0
   */
  verifyPage(pageNum, pageSize) {
    const page = { pageNum, pageSize };
    for (const key in page) {
      if (base.valueType(page[key]) !== 'number' || !/^\d+$/.test(page[key] + '') || page[key] < 1) {
        throw new Error(`${key}必须是大于0的整数`);
      }
    }
  },
  verifyValue(tableName, column, value) {
    const lineTableName = base.toLine(tableName);
    const lineKey = base.toLine(column);
    const info = `${tableName}.${column}.${value}`;
    const valueType = base.valueType(value);
    const columnType = dbInfo.getColumnType(lineTableName, lineKey);
    const types = dbInfo.dbDataTypes;
    if (types.number.indexOf(columnType) > -1 && valueType !== 'number') {
      throw new Error(`${info} 必须是数字类型`);
    }
    if ((types.string.indexOf(columnType) > -1) && valueType !== 'string') {
      throw new Error(`${info} 必须是字符串类型`);
    }
  },


};
