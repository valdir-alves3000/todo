const { describe, it, before, afterEach, beforeEach } = require("mocha");
const { expect } = require("chai");
const TodoService = require("../src/todoService");
const { createSandbox } = require("sinon");
const Todo = require("../src/todo");

describe("TodoService", () => {
  let sandbox;
  before(() => {
    sandbox = createSandbox();
  });

  afterEach(() => sandbox.restore());

  describe("#list", () => {
    const mockDataBase = [
      {
        name: "Zezin da Silva",
        age: "77",
        meta: { revision: 0, created: 1705323321599, version: 0 },
        $loki: 1,
      },
    ];

    let todoService;
    beforeEach(() => {
      const dependencies = {
        todoRepository: {
          list: sandbox.stub().returns(mockDataBase),
        },
      };

      todoService = new TodoService(dependencies);
    });

    it("should return data on a specific format", () => {
      const result = todoService.list();
      const [{ meta, $loki, ...expected }] = mockDataBase;

      expect(result).to.be.deep.equal([expected]);
    });
  });

  describe("#create", () => {
    let todoService;
    beforeEach(() => {
      const dependencies = {
        todoRepository: {
          create: sandbox.stub().returns(true),
        },
      };

      todoService = new TodoService(dependencies);
    });

    it("shouldn't save todo item with invalid data", () => {
      const data = new Todo({
        text: "",
        when: "",
      });
      Reflect.deleteProperty(data, "id");

      const expected = {
        error: {
          message: "invalid data",
          data: data,
        },
      };
      const result = todoService.create(data);
      expect(result).to.be.deep.equal(expected);
    });

    it("should save todo item with late status when property is further than today", () => {
      const properties = {
        text: "I must walk my dog",
        when: new Date("2020-12-01 12:00:00 GMT-0"),
      };

      const data = new Todo(properties);
      Reflect.set(data, "id", "00001");

      const today = new Date("2020-12-02");
      sandbox.useFakeTimers(today.getTime());

      todoService.create(data);

      const expectedCallWith = {
        ...properties,
        id: data.id,
        status: "late",
      };
      expect(
        todoService.todoRepository.create.calledOnceWithExactly(
          expectedCallWith
        )
      ).to.be.ok;
    });

    it("should save todo item with pending status", () => {
      const properties = {
        text: "I must walk my dog",
        when: new Date("2020-12-11 12:00:00 GMT-0"),
      };

      const data = new Todo(properties);
      Reflect.set(data, "id", "00001");

      const today = new Date("2020-12-02");
      sandbox.useFakeTimers(today.getTime());

      todoService.create(data);

      const expectedCallWith = {
        ...properties,
        id: data.id,
        status: "pending",
      };
      expect(
        todoService.todoRepository.create.calledOnceWithExactly(
          expectedCallWith
        )
      ).to.be.ok;
    });
  });
});
