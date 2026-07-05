# MicroAgent

Multi-model AI chat workspace.

# AI API Quick Start

Get started with SumoPod AI API in minutes. Compatible with OpenAI SDK and tools.

**Base URL:**
```
https://ai.sumopod.com
```

## Getting Started

### 1. Authentication

Create an API key from the API Keys tab. Set a budget limit to control your spending.

**API Key Format:**
```
sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> **Pro Tips:**
> - Set budget limits to avoid unexpected charges
> - Use different keys for different projects
> - Monitor usage in the Usage tab
> - Keep your API keys secure and never share them

### 2. Code Examples

**Python**

Install: `pip install openai`

```python
from openai import OpenAI

# Initialize client with SumoPod AI
client = OpenAI(
    api_key="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    base_url="https://ai.sumopod.com/v1"
)

# Make a chat completion request
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": "Say hello in a creative way"}
    ],
    max_tokens=150,
    temperature=0.7
)

print(response.choices[0].message.content)
```

### 3. Streaming Response (Python)

Get real-time streaming responses for better user experience:

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    base_url="https://ai.sumopod.com/v1"
)

# Stream the response
stream = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": "Write a short story about AI"}
    ],
    max_tokens=500,
    temperature=0.7,
    stream=True  # Enable streaming
)

# Print each chunk as it arrives
for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```
