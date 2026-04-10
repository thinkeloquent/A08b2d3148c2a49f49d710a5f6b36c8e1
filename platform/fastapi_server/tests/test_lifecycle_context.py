
import asyncio
import sys
import os
from unittest.mock import MagicMock, AsyncMock

# Add project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

import importlib.util

def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module

lifecycle_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../config/lifecycle'))
state_machine_path = os.path.join(lifecycle_dir, '04_state_machine.py')
decorators_path = os.path.join(lifecycle_dir, '100_on_request_decorators.py')

state_machine_mod = load_module("state_machine_04", state_machine_path)
decorators_mod = load_module("decorators_100", decorators_path)

onStartupState = state_machine_mod.onStartup
StateMachineMiddleware = state_machine_mod.StateMachineMiddleware
StateContainer = state_machine_mod.StateContainer
AttributeDict = state_machine_mod.AttributeDict
onStartupDecorators = decorators_mod.onStartup
RequestDecoratorsMiddleware = decorators_mod.RequestDecoratorsMiddleware

async def run_test():
    print("Running FastAPI Lifecycle Verification...")

    # Mock App
    app = MagicMock()
    app.state = MagicMock()

    # Config
    config = {
        "initial_state": {
            "mode": "active",
            "context": {"foo": "bar"}
        }
    }

    # Pre-requisites for 100
    mock_shared_context = MagicMock()
    mock_shared_context.create_child.return_value = "child_context"
    app.state.sharedContext = mock_shared_context
    app.state.context_registry = "registry"
    app.state.sdk = "sdk"

    # Run Hooks - these no longer add middleware, they store classes on app.state
    await onStartupState(app, config)
    await onStartupDecorators(app, config)

    # Verify Classes Stored on app.state (new architecture)
    assert app.state.initial_state == config["initial_state"], "initial_state should be stored"
    assert app.state.StateContainerClass == StateContainer, "StateContainerClass should be stored"
    assert app.state.AttributeDictClass == AttributeDict, "AttributeDictClass should be stored"
    assert app.state.RequestDecoratorsMiddlewareClass == RequestDecoratorsMiddleware, "RequestDecoratorsMiddlewareClass should be stored"

    print("Classes stored on app.state correctly")

    # Test 1: StateMachineMiddleware dispatch
    # Create middleware instance directly (as server.py would)
    state_mw = StateMachineMiddleware(app, initial_state=config["initial_state"])

    mock_request = MagicMock()
    mock_request.app = app

    async def call_next_1(req):
        return "next_1"

    await state_mw.dispatch(mock_request, call_next_1)

    # Verify State (04)
    assert hasattr(mock_request, 'state'), "request.state should exist"
    assert hasattr(mock_request.state, 'mode'), "request.state.mode should exist"
    assert mock_request.state.mode == "active"
    assert mock_request.state.context.foo == "bar"
    # Verify Dot Access
    assert mock_request.state.context['foo'] == "bar"
    # Verify Utilities
    assert mock_request.state.get_mode() == "active"
    mock_request.state.set_mode("processing")
    assert mock_request.state.mode == "processing"
    mock_request.state.transition("completed", {"result": "done"})
    assert mock_request.state.mode == "completed"
    assert mock_request.state.context.result == "done"

    print("StateMachineMiddleware dispatch verified")

    # Reset mode for next test
    mock_request.state.mode = "active"

    # Test 2: RequestDecoratorsMiddleware dispatch
    decorators_mw = RequestDecoratorsMiddleware(app)

    async def call_next_2(req):
        return "next_2"

    await decorators_mw.dispatch(mock_request, call_next_2)

    # Verify Decorators (100)
    # Check if attached to request.context (separate from request.state)
    assert mock_request.context.sharedContext == "child_context"
    assert mock_request.context.context_registry == "registry"
    assert mock_request.context.config_sdk == "sdk"

    print("RequestDecoratorsMiddleware dispatch verified")

    # Verify Namespace Separation
    assert mock_request.state is not mock_request.context, "request.state and request.context should be separate"

    print("Namespace separation verified")

    print("FastAPI Lifecycle Verification Passed!")

if __name__ == "__main__":
    asyncio.run(run_test())
