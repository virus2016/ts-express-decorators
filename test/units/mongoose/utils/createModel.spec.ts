import {ConverterService, InjectorService} from "@tsed/common";
import {Store} from "@tsed/core";
import * as mongoose from "mongoose";
import {createModel} from "../../../../src/mongoose/utils";
import {expect, Sinon} from "../../../tools";

describe("createSchema()", () => {

    describe("when the model name is given", () => {
        class Test {
        }

        before(() => {
            this.schema = {
                loadClass: Sinon.stub()
            };

            this.modelStub = Sinon.stub(mongoose, "model");

            this.converterStub = {
                serializeClass: Sinon.stub()
            };

            this.injectorGetStub = Sinon.stub(InjectorService, "get").returns(this.converterStub);

            createModel(Test, this.schema, "name", "collection", true);

            this.instance = new Test();
            this.instance.serialize({checkRequiredValue: "checkRequiredValue", ignoreCallback: "ignoreCallback"});
        });

        after(() => {
            this.modelStub.restore();
            this.injectorGetStub.restore();
        });

        it("should store the model name", () => {
            expect(Store.from(Test).get("mongooseModelName")).to.equals("name");
        });

        it("should call loadClass", () => {
            this.schema.loadClass.should.have.been.calledWithExactly(Test);
        });

        it("should call mongoose.model", () => {
            this.modelStub.should.have.been.calledWithExactly("name", this.schema, "collection", true);
        });

        it("should call injectorGetStub when class Test is instanced", () => {
            this.injectorGetStub.should.have.been.calledWithExactly(ConverterService);
        });

        it("should converter.serializeClass", () => {
            this.converterStub.serializeClass.should.have.been.calledWithExactly(this.instance, {
                type: Test,
                checkRequiredValue: "checkRequiredValue",
                ignoreCallback: "ignoreCallback"
            });
        });
    });
    describe("when the model name is not given", () => {
        class Test {
        }

        before(() => {
            this.schema = {
                loadClass: Sinon.stub()
            };

            this.modelStub = Sinon.stub(mongoose, "model");

            this.converterStub = {
                serializeClass: Sinon.stub()
            };

            this.injectorGetStub = Sinon.stub(InjectorService, "get").returns(this.converterStub);

            createModel(Test, this.schema);

            this.instance = new Test();
            this.instance.serialize({checkRequiredValue: "checkRequiredValue", ignoreCallback: "ignoreCallback"});
        });

        after(() => {
            this.modelStub.restore();
            this.injectorGetStub.restore();
        });

        it("should store the model name", () => {
            expect(Store.from(Test).get("mongooseModelName")).to.equals("Test");
        });

        it("should call loadClass", () => {
            this.schema.loadClass.should.have.been.calledWithExactly(Test);
        });

        it("should call mongoose.model", () => {
            this.modelStub.should.have.been.calledWithExactly("Test", this.schema, undefined, undefined);
        });

        it("should call injectorGetStub when class Test is instanced", () => {
            this.injectorGetStub.should.have.been.calledWithExactly(ConverterService);
        });

        it("should converter.serializeClass", () => {
            this.converterStub.serializeClass.should.have.been.calledWithExactly(this.instance, {
                type: Test,
                checkRequiredValue: "checkRequiredValue",
                ignoreCallback: "ignoreCallback"
            });
        });
    });

});