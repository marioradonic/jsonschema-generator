'use strict';

/**
 * Transforms any json object to JSONSchema
 * @param  {json} originalTree
 * @param  {boolean} required //optional
 * @return {object} jsonschema
 */
function jsonTreeToSchema (originalTree, required) {
	var jsonSchema = {};
	var type = _typeof(originalTree);
	jsonSchema.type = type;
	jsonSchema.required = typeof required === 'boolean' ? required : true; //For now let default to be true

	if(type === 'object') {
		jsonSchema.properties = {};
		for (var key in originalTree) {
			jsonSchema.properties[key] = jsonTreeToSchema(originalTree[key]);
		}
	} else if(type === 'array') {
		var itemsSchemas = [];
		originalTree.forEach(function (item) {
			itemsSchemas.push( jsonTreeToSchema(item) );
		});
		jsonSchema.items = mergeSchemas(itemsSchemas);
		if( jsonSchema.items && typeof jsonSchema.items.required === 'boolean') {
			delete jsonSchema.items.required; //its not necessary to have required on arrays item
		}
	}
	return jsonSchema;
}

/**
 * Merge an array of schemas into one schema
 * @param  {array} schemas
 * @return {object}
 */
function mergeSchemas (schemas) {
	if(!schemas || !schemas.length) {
		return null;
	}
	var mergedSchema = _deepClone(schemas[0]);

	mergedSchema.type = schemas[0].type;
	for (var i = 1; i < schemas.length; i++) {
		var schema = _deepClone(schemas[i]);

		mergedSchema.type = _mergeArraysAndStrings(mergedSchema.type, schema.type);
		if(schema.type === 'array') {
			if(mergedSchema.items && schema.items) {
				mergedSchema.items = mergeSchemas([mergedSchema.items, schema.items]);
			} else {
				mergedSchema.items = mergedSchema.items || schema.items;
			}
		} else if (schema.type === 'object') {
			if(!schema.properties || !mergedSchema.properties) {
				mergedSchema.properties = mergedSchema.properties || schema.properties;
			} else {
				for(var key in schema.properties) {
					if(!(key in mergedSchema.properties)) {
						mergedSchema.properties[key] = schema.properties[key];
						mergedSchema.properties[key].required = false;
					} else {
						mergedSchema.properties[key] = mergeSchemas([mergedSchema.properties[key], schema.properties[key]]);
					}
				}
				for (key in mergedSchema.properties) {
					if(!(key in schema.properties)) {
						mergedSchema.properties[key].required = false;
					}
				}
			}
		}
	}
	return mergedSchema;
}

/**
 * Returns string if both parameters are equeal strings,
 * in all other cases it will return merged array
 * @param  {string|array} schemaOneType
 * @param  {string|array} schemaTwoType
 * @return {string|array}
 */
function _mergeArraysAndStrings (schemaOneType, schemaTwoType) {
	if(_typeof(schemaOneType) === 'string' && _typeof(schemaTwoType) === 'string') {
		if(schemaOneType !== schemaTwoType) {
			return [schemaOneType, schemaTwoType];
		} else {
			return schemaOneType;
		}
	} else if(_typeof(schemaOneType) === 'array' || _typeof(schemaTwoType) === 'array'){
		schemaOneType = _castToArray(schemaOneType);
		schemaTwoType = _castToArray(schemaTwoType);
		return _mergeUniques(schemaOneType, schemaTwoType);
	} else {
		throw 'Unsuported type of schema type';
	}
}

/**
 * Return array of unique values
 * @param  {array} arrayOne
 * @param  {array} arrayTwo
 * @return {array}
 */
function _mergeUniques (arrayOne, arrayTwo) {
	var result = _deepClone(arrayOne);
	arrayTwo.forEach(function (val) {
		if(result.indexOf(val) === -1) {
			result.push(val);
		}
	});
	return result;
}

/**
 * If given string, it wraps it in array, otherwise returns same array
 * @param  {string|array} val
 * @return {array}
 */
function _castToArray (val) {
	return [].concat(val);
}

function _typeof (instance) {
	var type = typeof instance;
	if(type === 'object') {
		if(instance instanceof Array) {
			return 'array';
		} else if(instance instanceof Date) {
			throw 'Date handling not yet implemented!';
			// return 'date';
		} else if(instance === null) {
			return 'null';
		}
	}
	return type;
}

/**
 * Creates deep clone, only works with primitive values
 * @param  {object} obj
 * @return {object}
 */
function _deepClone (obj) {
	return JSON.parse(JSON.stringify(obj));
}
var JSONSchemaGenerator = {};

JSONSchemaGenerator.jsonTreeToSchema = jsonTreeToSchema;
JSONSchemaGenerator.mergeSchemas = mergeSchemas;

module.exports = JSONSchemaGenerator;