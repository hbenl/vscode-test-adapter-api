# VS Code Test Adapter API

This package contains the APIs that Test Adapters or Test Controllers need to implement to work with the
[VS Code Test Explorer](https://github.com/hbenl/vscode-test-explorer).

The API documentation can be found [here](https://github.com/hbenl/vscode-test-adapter-api/blob/master/src/index.ts)

## New API in version 1.0

Version 1.0 of this package contains a new Test Adapter API, which is very similar to the pre-1.0 API
but requires some changes to Test Adapters. The old API is still supported but it is deprecated, so
Test Adapters should move to the new API.
You can still access the old API with an import like this:
```
import { TestAdapter } from 'vscode-test-adapter-api/out/legacy';
```
To move to the new API, the following changes are necessary:
* the Test Adapter must offer a new event source `tests` that is used to send events when it starts and finishes
  loading the test definitions:
```
tests: vscode.Event<TestLoadStartedEvent | TestLoadFinishedEvent>;
```
* it should start loading the test definitions immediately after being registered with the Test Explorer extension
  (instead of waiting for a call to the `load()` method)
* when it detects any changes to the test files or its configuration that make it necessary to reload the test
  definitions, it should start doing so immediately; the `reload` event source has been removed
* the loaded test definitions are now sent using the `TestLoadFinishedEvent`, not as the return value of the 
  `load()` method
* it must send a `TestRunStartedEvent` and a `TestRunFinishedEvent` at the beginning and end of a test run, repectively.
