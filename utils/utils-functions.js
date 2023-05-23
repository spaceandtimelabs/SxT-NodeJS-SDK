
function checkUserIdFormat(userId) {
    if (typeof userId !== 'string' && typeof userId !== 'number') {
        throw new Error(`User ID must be a string or a number, but got ${typeof userId}`);
    }
}

function checkStringFormat(userString) {
    if(userString.length === 0) {
        throw new Error('Empty String provided.')
    }
    else if(typeof userString !== 'string') {
        throw new Error(`Expected a String but got ${typeof userString} `)
    }
}

const VALID_DB_RESOURCE_IDENTIFIER = /^[A-Z_][A-Z0-9_]+$/;
const INVALID_RESOURCEID = "Invalid resourceId";
const DEFAULT_SCHEMA = "PUBLIC";

function isValidDatabaseIdentifier(input) {
  return VALID_DB_RESOURCE_IDENTIFIER.test(input);
}

function checkPostgresIdentifier(resourceId) {
  const parts = resourceId.toUpperCase().split(".");
  let schemaName, tableName;
  if (parts.length === 0 || parts.length > 2) {
    throw new Error(`${INVALID_RESOURCEID}: Provided table identifier format is invalid`);
  } else if (parts.length === 1) {
    schemaName = DEFAULT_SCHEMA;
    tableName = parts[0];
  } else {
    schemaName = parts[0];
    tableName = parts[1];
  }
  if (!isValidDatabaseIdentifier(schemaName) || !isValidDatabaseIdentifier(tableName)) {
    throw new Error(`${INVALID_RESOURCEID}: Either schema or table identifier is invalid`);
  }
  return { schemaName, tableName };
}

function checkBooleanFormat(userBoolean) {
    if(typeof userBoolean !== 'boolean') {
        throw new Error(`Expected a boolean but got ${typeof userBoolean}`)
    }
}

function checkIsSameUrl(url1, url2) {
    return url1 === url2;

    /*
    EXAMPLE: 
    url1: `https://gtw-alpha-dev.spaceandtime.dev/v1/auth/idexists/${userId}`;
    url2: `https://gtw-alpha-dev.spaceandtime.dev/v1/auth/idexists/6e4e68f9-db37-488f-908f-ca1d98d5bc5f`;
    */
}

function checkPrefixAndJoinCode(prefix, joinCode) {
    if (typeof prefix !== 'string' || typeof joinCode !== 'string') {
      const errorPrefix = typeof prefix === 'string' ? '' : `Unexpected type of ${typeof prefix} for prefix`;
      const errorJoinCode = typeof joinCode === 'string' ? '' : `${typeof prefix !== 'string' ? ' and' : null} Unexpected type of ${typeof joinCode} for joinCode`;
      throw new Error(`${errorPrefix}${errorJoinCode}`);
    }
}


function isBase64(str) {
  const base64Regex = /^(?:[A-Za-z0-9+/]{4})*?(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

  if (!base64Regex.test(str)) {
    throw new Error("String is not base64 encoded");
  }

  return true;
}


  function isHexString(str) {
    return /^[0-9a-fA-F]+$/.test(str);
  }  
  
function checkSignature(signature) {
    const regex = /[0-9A-Fa-f]{6}/g; 
    return regex.test(signature);
}

let Utils = {
    checkUserIdFormat,
    checkStringFormat,
    checkPostgresIdentifier,
    checkBooleanFormat,
    checkIsSameUrl,
    checkPrefixAndJoinCode,
    checkSignature,
    isBase64,
    isHexString,
}   


export default Utils;