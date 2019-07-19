<!--
 * @Description: 
 * @Author: zhongshuai
 * @Date: 2019-05-26 17:36:36
 * @LastEditors: zhongshuai
 * @LastEditTime: 2019-07-19 17:05:59
 -->
# mysql-easy-sql
# Json to SQL is much easier

## example
    const mysqlEasySql = require('mysql-easy-sql');

### set database info
    const informationSchema = app.mysql.createInstance(mysql.informationSchema);
    const database = mysql.client.database;
    const table = await informationSchema.query(` SELECT a.* FROM TABLES a where a.TABLE_SCHEMA = '${database}'`);
    const column = await informationSchema.query(` SELECT a.* FROM COLUMNS a  WHERE a.TABLE_NAME in (SELECT a.TABLE_NAME   FROM TABLES a where a.TABLE_SCHEMA = '${database}')`);
    mysqlEasySql.setDbInfoConfig({ table, column });

### query
      const example = {
        // 必须传入字段
        tableName: 'teTest',
        //where 可以不传
        //where 传入的字段必须是tableName中存在的字段，否则报错提示
        //where 传入的sql关键字只能是 ['=','!=', '>', '>=', '<', '<=', 'between', 'not between', 'like', 'is' , 'in'],否则会报错
        where: {
          //时间格式: 请转化成2016-02-22 15:33:10，或则传入unit时间戳，不支持其他格式，如果传入其他时间格式，不会报错，会是查询结果错误
          dateTime: {
            // '>=': '2016-02-22 15:33:10', 
            // '<=': '2020-02-22 15:33:10', 
            // 'between': ['2016-02-22 15:33:10', '2020-02-22 15:33:10'], // between 和 not between 后面必须是一个length=2的数组， 否则会报错
            // 'not between': ['2010-02-22 15:33:10', '2011-02-22'] 
            '>=': 1298388790, 
            '<=': 1614007990, 
            'between': [1298388790, 1614007990], // between 和 not between 后面必须是一个length=2的数组， 否则会报错
            'not between': ['45', '23'] 
          },
          // in 有两种模式, 下面的是简写，也可以这样： enum: {in :[1, 11]}, 
          enum: [1, 11],  
          // text: {
          //   like: '%11%', //注意like 中的 %、_ 等通配符需要拼接到value中
          //   '=': '1121', 
          //   is: 'not null', // is 的值只能是 not null 和  null
          //   in: ['1121'] 
          // },
          // = 也有两种模式，下面的是简写，也可以这样：id: {"=" , 1}
          id: '1'
        },
        //columns 如果不传,则查询表中的所有字段，传入的字段必须是tableName中存在的字段，否则报错
        columns: ['enum', 'text', 'dateTime'],
        //orders 可以不传，传入的字段必须是tableName中存在的字段，否则报错
        orders: { id: 'desc' },
        //page 可以不传，必须是大于0的整数      
        pageNum: 1,
        pageSize: 10,
      };
    mysqlEasySql.getSelectSqlByParam(example);
    return 
    SELECT a.`enum` AS enum, a.`text` AS text, unix_timestamp(a.`date_Time`) AS dateTime
    FROM `Te_test` a
    WHERE (a.`date_Time` >= from_unixtime(1298388790)
      AND a.`date_Time` <= from_unixtime(1614007990)
      AND a.`date_Time` BETWEEN from_unixtime(1298388790) AND from_unixtime(1614007990)
      AND a.`date_Time` NOT BETWEEN from_unixtime(45) AND from_unixtime(23)
      AND a.`enum` IN (1, 11)
      AND a.`id` = '1')
    ORDER BY a.`id` DESC
    LIMIT 0, 10

### update 
    const example = {
        // 必须传入字段
        tableName: 'teTest',
        where: {
          id: '1'
        },
        //必传
        data: { text: '54444' }
    };
    mysqlEasySql.getUpdateSqlByParam(example);

    return update `Te_test` a set a.`text` = '54444'  where a.`id` = '1' 

### inset   
    const example = {
      // 必须传入字段
      tableName: 'teTest',
      data: { 
        id: '111', text: '54444', enum: 3, dateTime: 1298388790 
      }
    };
    mysqlEasySql.getInsetSqlByParam(example);

    return 
    insert into `Te_test` ( `id` ,`text` ,`enum` ,`date_Time` ) values ( '111','54444',3,from_unixtime(1298388790) )

### delete
    const example = {
        // 必须传入字段
        tableName: 'teTest',
        id: '85afc8b5-7e08-11e9-af95-0'
    };
    mysqlEasySql.getDeleteSqlByParam(example);

    return 
    delete from  `Te_test` where `id` = '85afc8b5-7e08-11e9-af95-0'




