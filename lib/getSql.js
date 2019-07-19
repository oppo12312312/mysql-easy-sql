/*
 * @Description:
 * @Author: zhongshuai
 * @LastEditors: zhongshuai
 * @Date: 2019-02-20 14:03:16
 * @LastEditTime: 2019-07-19 16:23:31
 */

'use strict';
const base = require('./base');
const verify = require('./verify');
const dbInfo = require('./dbInfo');
const otherName = 'a';


module.exports = {
  /**
   * 校验SelectParam参数
   * @param {Object} param  见示例
   * @return {String} sql
   */
  getSelectSqlByParam(param) {
    verify.verifySelectParam(param);
    return this.getSelectSql(param.tableName, param.where || {}, param.columns || [], param.orders || {}, param.pageNum || 0, param.pageSize || 0);
  },
  getSelectSql(tableName, where = {}, columns = [], orders = {}, pageNum = 0, pageSize = 0) {
    verify.verifySelect(tableName, where, columns, orders);
    let sqlPage = '';
    if (pageNum > 0) {
      verify.verifyPage(pageNum, pageSize);
      sqlPage = base.getPage(pageNum, pageSize);
    }
    const lintTableName = base.toLine(tableName);
    const sqlTableName = base.getSqlTableName(tableName, otherName);
    if (columns.length === 0) {
      // 不传入columns 则查询表中的所有字段
      columns = dbInfo.getAllColumn(lintTableName);
      columns = columns.map(att => {
        return base.toHump(att);
      });
    }
    const sqlColumns = base.getSqlColumnQuery(tableName, columns, otherName);
    const sqlWhere = base.getSqlWhere(where, otherName, tableName);
    const sqlOrder = base.getSqlOrders(tableName, orders, otherName);
    return `select ${sqlColumns} from ${sqlTableName} where ${sqlWhere} ${sqlOrder} ${sqlPage}`;
  },
  getUpdateSqlByParam(param) {
    verify.verifyUpdateParam(param);
    return this.getUpdateSql(param.tableName, param.data || [], param.where || {});
  },
  getUpdateSql(tableName, data, where) {
    verify.verifyUpdate(tableName, data, where);
    const sqlTableName = base.getSqlTableName(tableName, otherName);
    const sqlSet = base.getSqlSet(data, tableName, otherName);
    const sqlWhere = base.getSqlWhere(where, otherName, tableName);
    return `update ${sqlTableName} set ${sqlSet}  where ${sqlWhere}`;
  },
  getInsetSqlByParam(param) {
    verify.verifyInsetParam(param);
    return this.getInsetSql(param.tableName, param.data || []);
  },
  getInsetSql(tableName, data) {
    const columns = base.getColumnsByData(data, tableName);
    verify.verifyInset(tableName, data, columns);
    const sqlTableName = base.getSqlTableName(tableName);
    const values = base.getSqlValuesInset(data, tableName);
    const sqlColumns = base.getSqlColumnInset(tableName, columns);
    return `insert into ${sqlTableName} ( ${sqlColumns} ) values ( ${values} )`;
  },

  getDeleteSqlByParam(param) {
    verify.verifyDeleteParam(param);
    return this.getDeleteSql(param.tableName, param.id);
  },
  getDeleteSql(tableName, id) {
    verify.verifyTableName(tableName);
    verify.verifyValue(tableName, 'id', id);
    const sqlTableName = base.getSqlTableName(tableName);
    return `delete from  ${sqlTableName} where \`id\` = '${id}'`;
  },
};
