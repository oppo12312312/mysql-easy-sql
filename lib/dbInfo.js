/*
 * @Description:
 * @Author: zhongshuai
 * @LastEditors: zhongshuai
 * @Date: 2019-02-20 16:36:39
 * @LastEditTime: 2019-05-24 14:31:58
 */
'use strict';
const dbTableName = 'TABLE_NAME';
const dbColumnName = 'COLUMN_NAME';
const dbDataType = 'DATA_TYPE';
const dbDataTypes = {
  number: [ 'tinyint', 'smallint', 'mediumint', 'int', 'bigint', 'float', 'double' ],
  string: [ 'char', 'varchar', 'tinytext', 'text', 'mediumtext', 'longtext' ],
  dateTime: [ 'datetime', 'time', 'date' ],
  timeType: 'unit', // "string or unit"
  dateTimeFormat: {
    datetime: '\'%Y-%m-%d %H:%i:%s\'',
    time: '\'%H:%i:%s\'',
    date: '\'%Y-%m-%d\'',
  },
};
const sqlKeys = [ '=', '!=', '>', '>=', '<', '<=', 'between', 'not between', 'like', 'is', 'in' ];
const descAsc = [ 'desc', 'asc' ];
let dbInfoConfig = {};

module.exports = {
  dbDataTypes,
  sqlKeys,
  descAsc,
  /**
   * 查询字段的类型
   * @param {String} lineTableName 表名称
   * @param {String} columnName 字段名称
   * @return {String} dataType 字段类型
   */
  getColumnType(lineTableName, columnName) {
    let dataType = '';
    const columnCfg = dbInfoConfig.column;
    columnCfg.forEach(attr => {
      if (attr[dbTableName].toUpperCase() === lineTableName.toUpperCase() && attr[dbColumnName].toUpperCase() === columnName.toUpperCase()) {
        dataType = attr[dbDataType];
        return dataType;
      }
    });
    return dataType;
  },
  /**
   * 判断字段在表中是否存在
   * @param {String} lineTableName 表名称
   * @param {String} columnName 字段名称
   * @return {boolean} 是否存在字段
   */
  getColumnExist(lineTableName, columnName) {
    return !(this.getColumnType(lineTableName, columnName) === '');
  },
  /**
   * 返回表是否存在
   * @param {string} lineTableName  表名称
   * @return {boolean} 是否存在表
   */
  getTableNameExist(lineTableName) {
    return !(this.getTableName(lineTableName) === '');
  },
  getTableName(lineTableName) {
    let result = '';
    const tableCfg = dbInfoConfig.table;
    for (let i = 0; i < tableCfg.length; i++) {
      const attr = tableCfg[i];
      if (attr[dbTableName].toUpperCase() === lineTableName.toUpperCase()) {
        result = attr[dbTableName];
        break;
      }
    }
    return result;
  },
  /**
   * 某一个表中所有的字段
   * @param {string} lineTableName  表名称
   * @return {Array} 字段数组
   */
  getAllColumn(lineTableName) {
    const columns = [];
    const columnCfg = dbInfoConfig.column;
    columnCfg.forEach(attr => {
      if (attr[dbTableName].toUpperCase() === lineTableName.toUpperCase()) {
        columns.push(attr[dbColumnName]);
      }
    });
    return columns;
  },
  getColumn(lineTableName, colnum) {
    let dbCloumn = '';
    const columns = this.getAllColumn(lineTableName);
    for (let i = 0; i < columns.length; i++) {
      const att = columns[i];
      if (att.toUpperCase() === colnum.toUpperCase()) {
        dbCloumn = att;
        break;
      }
    }
    return dbCloumn;
  },
  /**
     * 是否是时间格式
     * @param {String} lineTableName 表名称
     * @param {String} columnName 字段名称
     * @return {String} 是否是时间格式
     */
  isDateTime(lineTableName, columnName) {
    return this.getColumnType(lineTableName, columnName).indexOf('date') > -1;
  },
  setDbInfoConfig(value) {
    dbInfoConfig = value;
  },

};

