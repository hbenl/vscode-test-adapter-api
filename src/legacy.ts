import * as vscode from 'vscode';
import { TestSuiteInfo, TestInfo, TestSuiteEvent, TestEvent } from './index';

export interface TestAdapter {

	/**
	 * The workspace folder that this test adapter is associated with.
	 * There is usually one test adapter per workspace folder and testing framework.
	 */
	workspaceFolder?: vscode.WorkspaceFolder;

	/**
	 * Load the definitions of tests and test suites.
	 * @returns A promise that is resolved with the test tree (i.e. the hierarchy of suite
	 * and test definitions) or `undefined` (if no tests were found) or rejected if the test
	 * definitions could not be loaded.
	 */
	load(): Promise<TestSuiteInfo | undefined>;

	/**
	 * This event can be used by the adapter to trigger a reload of the test tree.
	 */
	readonly reload?: vscode.Event<void>;

	/**
	 * Run the specified tests.
	 * @returns A promise that is resolved when the test run is completed.
	 */
	run(tests: TestSuiteInfo | TestInfo): Promise<void>;

	/**
	 * Run the specified tests in the debugger.
	 * @returns A promise that is resolved when the test run is completed.
	 */
	debug(tests: TestSuiteInfo | TestInfo): Promise<void>;

	/**
	 * Stop the current test run.
	 */
	cancel(): void;

	/**
	 * This event is used by the adapter during a test run to inform the Test Explorer about
	 * tests and suites being started or completed.
	 */
	readonly testStates: vscode.Event<TestSuiteEvent | TestEvent>;

	/**
	 * This event can be used by the adapter to trigger a test run for all tests that have
	 * been set to "autorun" in the Test Explorer.
	 */
	readonly autorun?: vscode.Event<void>;
}
