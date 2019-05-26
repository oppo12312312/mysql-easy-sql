<!--
 * @Description: 
 * @Author: zhongshuai
 * @Date: 2019-05-26 17:36:36
 * @LastEditors: zhongshuai
 * @LastEditTime: 2019-05-26 17:48:17
 -->
# mysql-easy-sql

## example

### set database info
    `const informationSchema = app.mysql.createInstance(mysql.informationSchema);
    const database = mysql.client.database;
    const table = await informationSchema.query(` SELECT a.* FROM TABLES a where a.TABLE_SCHEMA = '${database}'`);
    const column = await informationSchema.query(` SELECT a.* FROM COLUMNS a  WHERE a.TABLE_NAME in (SELECT a.TABLE_NAME   FROM TABLES a where a.TABLE_SCHEMA = '${database}')`);
    dbInfo.setDbInfoConfig({ table, column });
    mysqlEasySql.setDbInfoConfig({ table, column });`

### query
    `const example = {
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
    mysqlEasySql.getSelectSqlByParam(example);`


