<!--
 * @Description: 
 * @Author: zhongshuai
 * @Date: 2019-05-26 17:36:36
 * @LastEditors: zhongshuai
 * @LastEditTime: 2019-05-26 17:40:02
 -->
# mysql-easy-sql

##example

    const informationSchema = app.mysql.createInstance(mysql.informationSchema);
    const database = mysql.client.database;
    const table = await informationSchema.query(` SELECT a.* FROM TABLES a where a.TABLE_SCHEMA = '${database}'`);
    const column = await informationSchema.query(` SELECT a.* FROM COLUMNS a  WHERE a.TABLE_NAME in (SELECT a.TABLE_NAME   FROM TABLES a where a.TABLE_SCHEMA = '${database}')`);
    dbInfo.setDbInfoConfig({ table, column });
    mysqlEasySql.setDbInfoConfig({ table, column });
