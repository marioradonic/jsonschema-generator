'use strict';
/*jshint quotmark: false */
var JSONSchemaGenerator = require('../lib/jsonschema-generator');

describe("Merging schemas", function() {
	var schemaA = {
	    "type": "object",
	    "required": true,
	    "properties": {
	        "id": {
	            "type": "number",
	            "required": true
	        },
	        "code": {
	            "type": "string",
	            "required": true
	        }
	    }
	};
	var schemaB = {
	    "type": "object",
	    "required": true,
	    "properties": {
	        "id": {
	            "type": "number",
	            "required": true
	        },
	        "code": {
	            "type": "string",
	            "required": true
	        },
	        "notRequired": {
	        	"id": "number",
	        	"required": true
	        }
	    }
	};
	var schemaC = {
	    "type": "object",
	    "required": true,
	    "properties": {
	        "id": {
	            "type": "number",
	            "required": true
	        },
	        "code": {
	            "type": "string",
	            "required": true
	        }
	    }
	};

	it("should produce equal schema for same schemas", function () {
		expect( JSONSchemaGenerator.mergeSchemas([schemaA, schemaA]) ).toEqual(schemaA);
	});

	var mergedSchemaAB = JSONSchemaGenerator.mergeSchemas([schemaA, schemaB]);
	var mergedSchemaBC = JSONSchemaGenerator.mergeSchemas([schemaB, schemaC]);
	it("should merge all properties", function() {
		expect( mergedSchemaAB ).not.toEqual( schemaA );
		expect( mergedSchemaAB ).not.toEqual( schemaB );

		expect( mergedSchemaBC ).not.toEqual( schemaB );
		expect( mergedSchemaBC ).not.toEqual( schemaC );

		expect(mergedSchemaAB.properties.notRequired).not.toBeUndefined();
		expect(mergedSchemaBC.properties.notRequired).not.toBeUndefined();
	});

	it("properties defined only on some schemas should have own property 'required' set to false ", function () {
		expect(mergedSchemaAB.properties.notRequired.required).toBe(false);
		expect(mergedSchemaBC.properties.notRequired.required).toBe(false);
	});



	schemaC = {
		"type": "object",
		"required": true,
		"properties": {
		    "id": {
		        "type": "object",
		        "required": true,
		        "properties": {
		        	"id": {
		        		"type": "number",
		        		"required": true
		        	}
		        }
		    },
		    "code": {
		        "type": "string",
		        "required": true
		    }
		}
	};
	var schemaD = {
		"type": "object",
		"required": true,
		"properties": {
		    "id": {
		        "type": "object",
		        "required": true,
		        "properties": {
		        	"id": {
		        		"type": "number",
		        		"required": true,
		        	},
		        	"notRequired": {
		        		"type": "number",
		        		"required": "true"
		        	}
		        }
		    },
		    "code": {
		        "type": "string",
		        "required": true
		    }
		}
	};

	var mergedSchemaCD = JSONSchemaGenerator.mergeSchemas([schemaC, schemaD]);
	it("should merge nested objects too. ", function(){
		expect(mergedSchemaCD.properties.id.properties.notRequired).not.toBeUndefined();
		expect(mergedSchemaCD.properties.id.properties.notRequired.required).toBe(false);
	});

	it("should figure out type when one is null and the other is not!", function () {
		expect(JSONSchemaGenerator.mergeSchemas([
			{
				"type": "object",
				"required": true,
				"properties": {
					"id": {type: "number", required: true},
					"name": {type: "string", required: true},
					"smaller_unit": {type: "null", required: true},
					"smaller_unit_factor": {type: "null", required: true}
				}
			}, {
				"type": "object",
				"required": true,
				"properties": {
					"id": {type: "number", required: true},
					"name": {type: "string", required: true},
					"smaller_unit": {type: "string", required: true},
					"smaller_unit_factor": {type: "null", required: true}
				}
			}
		])).toEqual({
			"type": "object",
			"required": true,
			"properties": {
				"id": {type: "number", required: true},
				"name": {type: "string", required: true},
				"smaller_unit": {type: ["null", "string"], required: true},
				"smaller_unit_factor": {type: "null", required: true}
			}
		});
	});

	it("should merge same arrays!", function () {
		var schema = {
				"type": "object",
				"required": true,
				"properties": {
					"arr": {
						type: "array",
						required: true,
						items: {
							type: 'object',
							properties: {
								"id": {type: "number", required: true},
								"smaller_unit": {type: "null", required: true}
							}
						}
					}
				}
			};
		expect(JSONSchemaGenerator.mergeSchemas([schema, schema])).toEqual(schema);
	});

	it("should merge arrays when one is null!", function () {
		var schemaA = {
				"type": "object",
				"required": true,
				"properties": {
					"arr": {
						type: "array",
						required: true,
						items: {type: "null", required: false}
					}
				}
			};
		var schemaB = _deepClone(schemaA);

		schemaB.properties.arr.items = {
			type: 'object',
			properties: {
				"id": {type: "number", required: true},
				"smaller_unit": {type: "null", required: true}
			}
		};

		expect(JSONSchemaGenerator.mergeSchemas([schemaA, schemaB])).toEqual({
		    type: 'object',
		    required: true,
		    properties: {
		        arr: {
		            type: 'array',
		            required: true,
		            items: {
		                type: ['null', 'object'],
		                required: false,
		                properties: {
		                    id: {
		                        type: 'number',
		                        required: true
		                    },
		                    smaller_unit: {
		                        type: 'null',
		                        required: true
		                    }
		                }
		            }
		        }
		    }
		});
	});

	function _deepClone (obj) {
		return JSON.parse(JSON.stringify(obj));
	}
});