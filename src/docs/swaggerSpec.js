export const swaggerSpec = {
  "openapi": "3.0.3",
  "info": {
    "title": "NexusCRUD Pro API",
    "description": "Enterprise-Grade High-Performance RESTful CRUD Engine & Real-Time Analytics API built with Express.js, Clean Architecture, and Zod Validation.",
    "version": "2.0.0",
    "contact": {
      "name": "DEEPAK POLISETTI",
      "email": "polisettideepak14348@gmail.com",
      "url": "https://github.com/DEEPAK21072005"
    },
    "license": {
      "name": "MIT",
      "url": "https://opensource.org/licenses/MIT"
    }
  },
  "servers": [
    {
      "url": "/api/v1",
      "description": "Production & Local V1 API Server"
    }
  ],
  "tags": [
    {
      "name": "Items",
      "description": "Core CRUD operations, filtering, pagination, and batch management"
    },
    {
      "name": "Analytics & Export",
      "description": "Aggregate business statistics and multi-format data export"
    },
    {
      "name": "Health",
      "description": "System liveness and memory diagnostics"
    }
  ],
  "paths": {
    "/health": {
      "get": {
        "tags": [
          "Health"
        ],
        "summary": "Health check and runtime diagnostics",
        "description": "Returns memory usage, uptime, Node environment, and server health status.",
        "responses": {
          "200": {
            "description": "Server is healthy",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SuccessResponse"
                }
              }
            }
          }
        }
      }
    },
    "/items": {
      "get": {
        "tags": [
          "Items"
        ],
        "summary": "Retrieve paginated items with filtering & search",
        "parameters": [
          {
            "in": "query",
            "name": "q",
            "schema": {
              "type": "string"
            },
            "description": "Search query matching name, description, or tags"
          },
          {
            "in": "query",
            "name": "category",
            "schema": {
              "type": "string",
              "enum": [
                "Electronics",
                "Software",
                "Hardware",
                "Design",
                "Marketing",
                "Operations",
                "Finance",
                "Other",
                "all"
              ]
            }
          },
          {
            "in": "query",
            "name": "status",
            "schema": {
              "type": "string",
              "enum": [
                "active",
                "pending",
                "archived",
                "all"
              ]
            }
          },
          {
            "in": "query",
            "name": "priority",
            "schema": {
              "type": "string",
              "enum": [
                "low",
                "medium",
                "high",
                "urgent",
                "all"
              ]
            }
          },
          {
            "in": "query",
            "name": "isFavorite",
            "schema": {
              "type": "string",
              "enum": [
                "true",
                "false"
              ]
            }
          },
          {
            "in": "query",
            "name": "minPrice",
            "schema": {
              "type": "number"
            }
          },
          {
            "in": "query",
            "name": "maxPrice",
            "schema": {
              "type": "number"
            }
          },
          {
            "in": "query",
            "name": "page",
            "schema": {
              "type": "integer",
              "default": 1
            }
          },
          {
            "in": "query",
            "name": "limit",
            "schema": {
              "type": "integer",
              "default": 10
            }
          },
          {
            "in": "query",
            "name": "sortBy",
            "schema": {
              "type": "string",
              "enum": [
                "createdAt",
                "updatedAt",
                "name",
                "price",
                "stock",
                "priority"
              ],
              "default": "createdAt"
            }
          },
          {
            "in": "query",
            "name": "sortOrder",
            "schema": {
              "type": "string",
              "enum": [
                "asc",
                "desc"
              ],
              "default": "desc"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "List of items with pagination metadata",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PaginatedItemsResponse"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Items"
        ],
        "summary": "Create a new item",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateItemRequest"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Item successfully created",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ItemResponse"
                }
              }
            }
          },
          "400": {
            "description": "Invalid input or missing fields"
          },
          "409": {
            "description": "Item with name already exists"
          },
          "422": {
            "description": "Zod validation error"
          }
        }
      }
    },
    "/items/{id}": {
      "get": {
        "tags": [
          "Items"
        ],
        "summary": "Get item by ID",
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Item found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ItemResponse"
                }
              }
            }
          },
          "404": {
            "description": "Item not found"
          }
        }
      },
      "put": {
        "tags": [
          "Items"
        ],
        "summary": "Update entire item",
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateItemRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Item updated"
          },
          "404": {
            "description": "Item not found"
          }
        }
      },
      "patch": {
        "tags": [
          "Items"
        ],
        "summary": "Partially update item fields",
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PatchItemRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Item updated"
          }
        }
      },
      "delete": {
        "tags": [
          "Items"
        ],
        "summary": "Delete an item",
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Item deleted successfully"
          },
          "404": {
            "description": "Item not found"
          }
        }
      }
    },
    "/items/stats/summary": {
      "get": {
        "tags": [
          "Analytics & Export"
        ],
        "summary": "Get aggregate analytics summary",
        "responses": {
          "200": {
            "description": "Statistics breakdown"
          }
        }
      }
    },
    "/items/export": {
      "get": {
        "tags": [
          "Analytics & Export"
        ],
        "summary": "Export items in JSON or CSV format",
        "parameters": [
          {
            "in": "query",
            "name": "format",
            "schema": {
              "type": "string",
              "enum": [
                "json",
                "csv"
              ],
              "default": "json"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Exported data file or JSON list"
          }
        }
      }
    },
    "/items/bulk-delete": {
      "post": {
        "tags": [
          "Items"
        ],
        "summary": "Batch delete multiple items",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "ids"
                ],
                "properties": {
                  "ids": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Deletion summary"
          }
        }
      }
    },
    "/items/bulk-create": {
      "post": {
        "tags": [
          "Items"
        ],
        "summary": "Bulk import items",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "items"
                ],
                "properties": {
                  "items": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/CreateItemRequest"
                    }
                  }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Items imported"
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Item": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "example": "item_abc123xyz"
          },
          "name": {
            "type": "string",
            "example": "Quantum Edge Server X1"
          },
          "description": {
            "type": "string",
            "example": "High-density edge computing server"
          },
          "category": {
            "type": "string",
            "example": "Hardware"
          },
          "price": {
            "type": "number",
            "example": 3499.99
          },
          "stock": {
            "type": "integer",
            "example": 15
          },
          "status": {
            "type": "string",
            "enum": [
              "active",
              "pending",
              "archived"
            ],
            "example": "active"
          },
          "priority": {
            "type": "string",
            "enum": [
              "low",
              "medium",
              "high",
              "urgent"
            ],
            "example": "urgent"
          },
          "tags": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "example": [
              "Edge",
              "AI",
              "Server"
            ]
          },
          "isFavorite": {
            "type": "boolean",
            "example": true
          },
          "version": {
            "type": "integer",
            "example": 1
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "CreateItemRequest": {
        "type": "object",
        "required": [
          "name"
        ],
        "properties": {
          "name": {
            "type": "string",
            "example": "NextGen AI Core"
          },
          "description": {
            "type": "string",
            "example": "Neural processing acceleration module"
          },
          "category": {
            "type": "string",
            "enum": [
              "Electronics",
              "Software",
              "Hardware",
              "Design",
              "Marketing",
              "Operations",
              "Finance",
              "Other"
            ],
            "default": "Other"
          },
          "price": {
            "type": "number",
            "default": 0
          },
          "stock": {
            "type": "integer",
            "default": 0
          },
          "status": {
            "type": "string",
            "enum": [
              "active",
              "pending",
              "archived"
            ],
            "default": "active"
          },
          "priority": {
            "type": "string",
            "enum": [
              "low",
              "medium",
              "high",
              "urgent"
            ],
            "default": "medium"
          },
          "tags": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "default": []
          },
          "isFavorite": {
            "type": "boolean",
            "default": false
          }
        }
      },
      "PatchItemRequest": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "category": {
            "type": "string"
          },
          "price": {
            "type": "number"
          },
          "stock": {
            "type": "integer"
          },
          "status": {
            "type": "string"
          },
          "priority": {
            "type": "string"
          },
          "tags": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "isFavorite": {
            "type": "boolean"
          }
        }
      },
      "SuccessResponse": {
        "type": "object",
        "properties": {
          "status": {
            "type": "string",
            "example": "success"
          },
          "statusCode": {
            "type": "integer",
            "example": 200
          },
          "message": {
            "type": "string",
            "example": "Success"
          },
          "data": {
            "type": "object"
          }
        }
      },
      "ItemResponse": {
        "type": "object",
        "properties": {
          "status": {
            "type": "string",
            "example": "success"
          },
          "statusCode": {
            "type": "integer",
            "example": 200
          },
          "message": {
            "type": "string"
          },
          "data": {
            "$ref": "#/components/schemas/Item"
          }
        }
      },
      "PaginatedItemsResponse": {
        "type": "object",
        "properties": {
          "status": {
            "type": "string",
            "example": "success"
          },
          "statusCode": {
            "type": "integer",
            "example": 200
          },
          "message": {
            "type": "string"
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Item"
            }
          },
          "meta": {
            "type": "object",
            "properties": {
              "pagination": {
                "type": "object",
                "properties": {
                  "currentPage": {
                    "type": "integer",
                    "example": 1
                  },
                  "limit": {
                    "type": "integer",
                    "example": 10
                  },
                  "totalPages": {
                    "type": "integer",
                    "example": 1
                  },
                  "totalItems": {
                    "type": "integer",
                    "example": 5
                  },
                  "hasNextPage": {
                    "type": "boolean",
                    "example": false
                  },
                  "hasPrevPage": {
                    "type": "boolean",
                    "example": false
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
