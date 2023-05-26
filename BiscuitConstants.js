
const SQLCommandType = {
    DDL: "ddl",
    DML: "dml",
    DQL: "dql",
  };

export default class SQLOperation {
    constructor(type, value) {
      this.CommandType = type;
      this.Value = value;
    }
  }
  
  SQLOperation.CREATE = new SQLOperation(SQLCommandType.DDL, "ddl_create");
  SQLOperation.ALTER = new SQLOperation(SQLCommandType.DDL, "ddl_alter");
  SQLOperation.DROP = new SQLOperation(SQLCommandType.DDL, "ddl_drop");
  SQLOperation.INSERT = new SQLOperation(SQLCommandType.DML, "dml_insert");
  SQLOperation.UPDATE = new SQLOperation(SQLCommandType.DML, "dml_update");
  SQLOperation.MERGE = new SQLOperation(SQLCommandType.DML, "dml_merge");
  SQLOperation.DELETE = new SQLOperation(SQLCommandType.DML, "dml_delete");
  SQLOperation.SELECT = new SQLOperation(SQLCommandType.DQL, "dql_select");
  
  Object.freeze(SQLOperation);