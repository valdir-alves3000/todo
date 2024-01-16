const { describe, it, before, afterEach } = require("mocha");
const { expect } = require("chai");
const TodoRepository = require("../src/todoRepository");
const { createSandbox } = require("sinon");

describe("TodoRepository", () => {
  let todoRepository;
  let sandbox;
  before(() => {
    todoRepository = new TodoRepository();
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("methods signature", () => {
    it("should call find from lokijs", () => {
      const mockDataBase = [
        {
          name: "Zezin da Silva",
          age: "77",
          meta: { revision: 0, created: 1705323321599, version: 0 },
          $loki: 1,
        },
      ];
      const functionName = "find";
      const expectedReturn = mockDataBase;

      sandbox
        .stub(todoRepository.schedule, functionName)
        .returns(expectedReturn);

      const result = todoRepository.list();
      expect(result).to.be.deep.equal(expectedReturn);
      expect(todoRepository.schedule[functionName].calledOnce).to.be.ok;
    });
    it("should call inserOne from lokijs", () => {
      const functionName = "insertOne";
      const expectedReturn = true;

      sandbox
        .stub(todoRepository.schedule, functionName)
        .returns(expectedReturn);

      const data = { name: "Jone" };
      const result = todoRepository.create(data);

      expect(todoRepository.schedule[functionName].calledOnceWithExactly(data))
        .to.be.ok;
    });
  });
});
