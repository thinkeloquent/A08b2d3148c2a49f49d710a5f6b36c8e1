"""
Tools Module - Tool Definitions and Executors

OpenAI function-calling compatible tool definitions and execution.
"""

import ast
import json
import operator
from typing import Any, Callable, Dict, List, Optional

from .logger import create

logger = create("gemini_openai_sdk", __file__)


# =============================================================================
# Tool Definitions (OpenAI Function Calling Format)
# =============================================================================

WEATHER_TOOL: Dict[str, Any] = {
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get the current weather for a location",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "The city and state, e.g., San Francisco, CA",
                },
                "unit": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"],
                    "description": "Temperature unit",
                },
            },
            "required": ["location"],
        },
    },
}

CALCULATOR_TOOL: Dict[str, Any] = {
    "type": "function",
    "function": {
        "name": "calculate",
        "description": "Perform a mathematical calculation",
        "parameters": {
            "type": "object",
            "properties": {
                "expression": {
                    "type": "string",
                    "description": "The mathematical expression to evaluate",
                },
            },
            "required": ["expression"],
        },
    },
}

# Default tools list
DEFAULT_TOOLS: List[Dict[str, Any]] = [WEATHER_TOOL, CALCULATOR_TOOL]


# =============================================================================
# Tool Executors
# =============================================================================

def execute_weather(args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Simulated weather tool implementation.

    Args:
        args: Dictionary with 'location' and optional 'unit'

    Returns:
        Weather data dictionary
    """
    logger.debug("execute_weather: enter", args=args)

    location = args.get("location", "Unknown")
    unit = args.get("unit", "celsius")

    result = {
        "location": location,
        "temperature": 22 if unit == "celsius" else 72,
        "unit": unit,
        "conditions": "sunny",
        "humidity": 45,
    }

    logger.info("execute_weather: success", location=location, unit=unit)
    return result


_SAFE_OPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}


def _eval_math_node(node):
    """Recursively evaluate an AST node containing only arithmetic."""
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return node.value
    if isinstance(node, ast.BinOp):
        op = _SAFE_OPS.get(type(node.op))
        if op is None:
            raise ValueError(f"Unsupported operator: {type(node.op).__name__}")
        return op(_eval_math_node(node.left), _eval_math_node(node.right))
    if isinstance(node, ast.UnaryOp):
        op = _SAFE_OPS.get(type(node.op))
        if op is None:
            raise ValueError(f"Unsupported operator: {type(node.op).__name__}")
        return op(_eval_math_node(node.operand))
    raise ValueError(f"Unsupported expression: {type(node).__name__}")


def safe_eval_math(expression: str):
    """Safely evaluate a mathematical expression using AST parsing."""
    tree = ast.parse(expression.strip(), mode="eval")
    return _eval_math_node(tree.body)


def execute_calculate(args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculator tool implementation.

    Uses AST-based safe math evaluation (no eval/exec).

    Args:
        args: Dictionary with 'expression' key

    Returns:
        Calculation result dictionary
    """
    logger.debug("execute_calculate: enter", args=args)

    expression = args.get("expression", "")

    # Security: Only allow safe math characters
    allowed_chars = set("0123456789+-*/.() ")
    if not all(c in allowed_chars for c in expression):
        logger.warn("execute_calculate: unsafe expression rejected", expression=expression)
        return {"expression": expression, "error": "Invalid expression - unsafe characters"}

    try:
        result = safe_eval_math(expression)
        logger.info("execute_calculate: success", expression=expression, result=result)
        return {"expression": expression, "result": result}
    except Exception as e:
        logger.error("execute_calculate: failed", expression=expression, error=str(e))
        return {"expression": expression, "error": "Invalid expression"}


# =============================================================================
# Tool Registry
# =============================================================================

_tool_registry: Dict[str, Callable[[Dict[str, Any]], Dict[str, Any]]] = {
    "get_weather": execute_weather,
    "calculate": execute_calculate,
}


def register_tool(
    name: str,
    executor: Callable[[Dict[str, Any]], Dict[str, Any]],
    definition: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Register a custom tool.

    Args:
        name: Tool function name
        executor: Function that executes the tool
        definition: Optional OpenAI tool definition
    """
    logger.info("register_tool: registering", name=name)
    _tool_registry[name] = executor


def execute_tool(function_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    """
    Execute a registered tool by name.

    Args:
        function_name: Name of the tool function
        arguments: Arguments dictionary for the tool

    Returns:
        Tool execution result
    """
    logger.debug("execute_tool: enter", function_name=function_name)

    executor = _tool_registry.get(function_name)

    if not executor:
        logger.error("execute_tool: unknown function", function_name=function_name)
        return {"error": f"Unknown function: {function_name}"}

    try:
        result = executor(arguments)
        logger.debug("execute_tool: success", function_name=function_name)
        return result
    except Exception as e:
        logger.error("execute_tool: failed", function_name=function_name, error=str(e))
        return {"error": str(e)}


def process_tool_calls(tool_calls: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Process multiple tool calls from model response.

    Args:
        tool_calls: List of tool call objects from API response

    Returns:
        List of tool results with call info and execution results
    """
    logger.debug("process_tool_calls: processing %d calls", len(tool_calls))
    results = []

    for tool_call in tool_calls:
        func_name = tool_call["function"]["name"]
        func_args_str = tool_call["function"]["arguments"]

        try:
            func_args = json.loads(func_args_str)
        except json.JSONDecodeError:
            func_args = {}
            logger.warn("process_tool_calls: failed to parse arguments", func_name=func_name)

        tool_result = execute_tool(func_name, func_args)

        results.append({
            "id": tool_call.get("id"),
            "function": func_name,
            "arguments": func_args,
            "result": tool_result,
        })

    logger.info("process_tool_calls: processed %d calls", len(results))
    return results


def get_available_tools() -> List[str]:
    """Get list of registered tool names."""
    return list(_tool_registry.keys())
