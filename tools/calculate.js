export const getCalculateTool = {
  type: 'function',
  function: {
    name: 'calculate',
    description: '進行數學計算',
    parameters: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: "數學運算式'",
        },
      },
      required: ['expression'],
    },
  },
};

export async function getCalculate({ expression }) {
  try {
    const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');

    if (!sanitized) {
      return { error: '無效的數學運算式' };
    }

    const result = new Function(`return ${sanitized}`)();

    return {
      expression: expression,
      result: result,
      status: 'success',
    };
  } catch (error) {
    return {
      error: `計算失敗: ${error.message}`,
    };
  }
}
