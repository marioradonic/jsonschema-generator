var JSONSchemaGenerator = require('../lib/jsonschema-generator');

describe('Creating schema from tree', function () {
	it("should merge different types!", function () {
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
		})
	});

	it("should create valid schema from json", function () {
		expect(JSONSchemaGenerator.jsonTreeToSchema({
          "id": 64782405,
          "name": "KO",
          "smaller_unit": null,
          "smaller_unit_factor": null
        })).toEqual({
			"type": "object",
			"required": true,
			"properties": {
				"id": {type: "number", required: true},
				"name": {type: "string", required: true},
				"smaller_unit": {type: "null", required: true},
				"smaller_unit_factor": {type: "null", required: true}
			}
        })
	});
})