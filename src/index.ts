import * as vscode from 'vscode';

export const testExplorerExtensionId = 'hbenl.vscode-test-explorer';

export interface TestExplorerExtension {
	registerAdapter(adapter: TestAdapter): void
	unregisterAdapter(adapter: TestAdapter): void
}

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

/**
 * Information about a test suite.
 */
export interface TestSuiteInfo {

	type: 'suite';

	id: string;

	/** The label to be displayed by the Test Explorer for this suite. */
	label: string;

	/** The absolute path of the file containing this suite (if known). */
	file?: string;

	/** The line within the specified file where the suite definition starts (if known). */
	line?: number;

	children: (TestSuiteInfo | TestInfo)[];
}

/**
 * Information about a test.
 */
export interface TestInfo {

	type: 'test';

	id: string;

	/** The label to be displayed by the Test Explorer for this test. */
	label: string;

	/** The absolute path of the file containing this test (if known). */
	file?: string;

	/** The line within the specified file where the test definition starts (if known). */
	line?: number;
}

/**
 * Information about a suite being started or completed during a test run.
 */
export interface TestSuiteEvent {

	type: 'suite';

	/** The suite that is being started or completed. This field usually contains the ID of the
	 * suite, but it may also contain the full information about a suite that is started if that
	 * suite had not been sent to the Test Explorer yet.
	 */
	suite: string | TestSuiteInfo;

	state: 'running' | 'completed';
}

/**
 * Information about a test being started, completed or skipped during a test run.
 */
export interface TestEvent {

	type: 'test';

	/**
	 * The test that is being started, completed or skipped. This field usually contains
	 * the ID of the test, but it may also contain the full information about a test that is
	 * started if that test had not been sent to the Test Explorer yet.
	 */
	test: string | TestInfo;

	state: 'running' | 'passed' | 'failed' | 'skipped';

	/**
	 * This message will be displayed by the Test Explorer when the user selects the test.
	 * It is usually used for information about why a test has failed.
	 */
	message?: string;
}
