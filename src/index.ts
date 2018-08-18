import * as vscode from 'vscode';
import { TestAdapter as LegacyTestAdapter } from './legacy';

export const testExplorerExtensionId = 'hbenl.vscode-test-explorer';

export interface TestHub {
	registerAdapter(adapter: LegacyTestAdapter): void;
	unregisterAdapter(adapter: LegacyTestAdapter): void;
	registerTestAdapter(adapter: TestAdapter): void;
	unregisterTestAdapter(adapter: TestAdapter): void;
	registerTestController(controller: TestController): void;
	unregisterTestController(controller: TestController): void;
}

export interface TestAdapter {
	workspaceFolder?: vscode.WorkspaceFolder;
	load(): Promise<void>;
	run(tests: TestSuiteInfo | TestInfo): Promise<void>;
	debug(tests: TestSuiteInfo | TestInfo): Promise<void>;
	cancel(): void;
	readonly tests: vscode.Event<TestLoadStartedEvent | TestLoadFinishedEvent>;
	readonly testStates: vscode.Event<TestRunStartedEvent | TestRunFinishedEvent | TestSuiteEvent | TestEvent>;
	readonly autorun?: vscode.Event<void>;
}

export interface TestController {
	registerTestAdapter(adapter: TestAdapter): void;
	unregisterTestAdapter(adapter: TestAdapter): void;
}

export interface TestLoadStartedEvent {
	type: 'started';
}

export interface TestLoadFinishedEvent {
	type: 'finished';
	suite: TestSuiteInfo | undefined;
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

	/** Indicates whether this test will be skipped during test runs */
	skipped?: boolean;
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

	/**
	 * These messages will be shown as decorations for the given lines in the editor.
	 * They are usually used to show information about a test failure at the location of that failure.
	 */
	decorations?: TestDecoration[];
}

export interface TestDecoration {
	line: number;
	message: string;
}

export interface TestRunStartedEvent {
	type: 'started';
	tests: TestSuiteInfo | TestInfo;	
}

export interface TestRunFinishedEvent {
	type: 'finished';
}
