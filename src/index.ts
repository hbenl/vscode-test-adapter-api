import * as vscode from 'vscode';
import { TestAdapter as LegacyTestAdapter } from './legacy';

/**
 * The ID of the Test Explorer extension. Use it to get the `TestHub` API like this:
 * ```
   const testHub = vscode.extensions.getExtension<TestHub>(testExplorerExtensionId).exports; ```
 * Don't forget to add an `extensionDependencies` entry to your `package.json`:
 * ```
   "extensionDependencies": [ "hbenl.vscode-test-explorer" ] ```
 */
export const testExplorerExtensionId = 'hbenl.vscode-test-explorer';

/**
 * This is the interface offered by the Test Explorer extension for registering
 * and unregistering Test Adapters and Test Controllers.
 */
export interface TestHub {
	registerTestAdapter(adapter: TestAdapter): void;
	unregisterTestAdapter(adapter: TestAdapter): void;
	registerTestController(controller: TestController): void;
	unregisterTestController(controller: TestController): void;

	/**
	 * @deprecated this is for adapters using the pre-1.0 API
	 */
	registerAdapter(adapter: LegacyTestAdapter): void;
	/**
	 * @deprecated this is for adapters using the pre-1.0 API
	 */
	unregisterAdapter(adapter: LegacyTestAdapter): void;
}

/**
 * This is the interface that must be implemented by Test Adapters.
 */
export interface TestAdapter {

	/**
	 * The workspace folder that this test adapter is associated with (if any).
	 * There is usually one test adapter per workspace folder and testing framework.
	 */
	workspaceFolder?: vscode.WorkspaceFolder;

	/**
	 * Start loading the definitions of tests and test suites.
	 * Note that this method is only used to give the user a chance to manually request a reload.
	 * The Test Adapter should load the test definitions immediately after being registered with
	 * the Test Explorer extension and should automatically reload them if necessary (due to changes
	 * to the test files or the adapter's configuration).
	 * @returns A promise that is resolved when the adapter finished loading the test definitions.
	 */
	load(): Promise<void>;

	/**
	 * Run the specified tests.
	 * @param tests An array of test or suite IDs. For every suite ID, all tests in that suite are run.
	 * @returns A promise that is resolved when the test run is completed.
	 */
	run(tests: string[]): Promise<void>;

	/**
	 * Run the specified tests in the debugger.
	 * @param tests An array of test or suite IDs. For every suite ID, all tests in that suite are run.
	 * @returns A promise that is resolved when the test run is completed.
	 */
	debug(tests: string[]): Promise<void>;

	/**
	 * Stop the current test run.
	 */
	cancel(): void;

	/**
	 * This event is used by the adapter to inform the Test Explorer (and other Test Controllers)
	 * that it started or finished loading the test definitions.
	 */
	readonly tests: vscode.Event<TestLoadStartedEvent | TestLoadFinishedEvent>;

	/**
	 * This event is used by the adapter during a test run to inform the Test Explorer
	 * (and other Test Controllers) about a test run and tests and suites being started or completed.
	 * For example, if there is one test suite with ID `suite1` containing one test with ID `test1`,
	 * a successful test run would emit the following events:
	 * ```
	 * { type: 'started' }
	 * { type: 'suite', suite: 'suite1', state: 'running' }
	 * { type: 'test', test: 'test1', state: 'running' }
	 * { type: 'test', test: 'test1', state: 'passed' }
	 * { type: 'suite', suite: 'suite1', state: 'completed' }
	 * { type: 'finished' } ```
	 */
	readonly testStates: vscode.Event<TestRunStartedEvent | TestRunFinishedEvent | TestSuiteEvent | TestEvent>;

	/**
	 * This event can be used by the adapter to trigger a test run for all tests that have
	 * been set to "autorun" in the Test Explorer.
	 */
	readonly autorun?: vscode.Event<void>;
}

/**
 * This is the interface that must be implemented by Test Controllers
 */
export interface TestController {

	/**
	 * Register the given Test Adapter. The Test Controller should subscribe to the `adapter.tests`
	 * event source immediately in order to receive the test definitions.
	 */
	registerTestAdapter(adapter: TestAdapter): void;

	unregisterTestAdapter(adapter: TestAdapter): void;
}

/**
 * This event is sent by a Test Adapter when it starts loading the test definitions.
 */
export interface TestLoadStartedEvent {
	type: 'started';
}

/**
 * This event is sent by a Test Adapter when it finished loading the test definitions.
 */
export interface TestLoadFinishedEvent {

	type: 'finished';

	/** The test definitions that have just been loaded */
	suite: TestSuiteInfo | undefined;
}

/**
 * This event is sent by a Test Adapter when it starts a test run.
 */
export interface TestRunStartedEvent {
	type: 'started';

	/** The test(s) that will be run */
	tests: TestSuiteInfo | TestInfo;	
}

/**
 * This event is sent by a Test Adapter when it finished a test run.
 */
export interface TestRunFinishedEvent {
	type: 'finished';
}

/**
 * Information about a test suite.
 */
export interface TestSuiteInfo {

	type: 'suite';

	id: string;

	/** The label to be displayed by the Test Explorer for this suite. */
	label: string;

	/**
	 * The file containing this suite (if known).
	 * This can either be an absolute path (if it is a local file) or a URI.
	 * Note that this should never contain a `file://` URI.
	 */
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

	/**
	 * The file containing this test (if known).
	 * This can either be an absolute path (if it is a local file) or a URI.
	 * Note that this should never contain a `file://` URI.
	 */
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

	/**
	 * The suite that is being started or completed. This field usually contains the ID of the
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
