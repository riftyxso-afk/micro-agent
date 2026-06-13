import json

import server


def test_provider_url_appends_chat_completions():
    assert server.provider_url("https://example.test/v1") == "https://example.test/v1/chat/completions"


def test_provider_url_keeps_chat_completions():
    url = "https://example.test/v1/chat/completions"
    assert server.provider_url(url) == url


def test_provider_model_known_id(monkeypatch):
    monkeypatch.setenv("OPENAI_MODEL", "fallback-model")
    assert server.provider_model("gpt-5-5", False) == "cx/gpt-5.5"


def test_provider_model_unknown_uses_fallback(monkeypatch):
    monkeypatch.setenv("OPENAI_MODEL", "fallback-model")
    assert server.provider_model("missing", False) == "fallback-model"


def test_provider_model_auto_uses_fallback_first(monkeypatch):
    monkeypatch.setenv("OPENAI_MODEL", "fallback-model")
    assert server.provider_model(None, True) == "fallback-model"


def test_sse_outputs_event_and_json_data():
    raw = server.sse("token", {"text": "halo"})
    assert raw.startswith("event: token\n")
    assert raw.endswith("\n\n")
    data_line = raw.splitlines()[1]
    assert json.loads(data_line.removeprefix("data: ")) == {"text": "halo"}


def test_cors_origins_trims_empty_values(monkeypatch):
    monkeypatch.setenv("CORS_ORIGINS", " http://localhost:3000, ,http://127.0.0.1:3000 ")
    assert server.cors_origins() == ["http://localhost:3000", "http://127.0.0.1:3000"]


def test_has_user_content_rejects_empty_messages():
    payload = server.ChatStreamRequest(messages=[{"role": "user", "content": "   "}])
    assert server.has_user_content(payload.messages) is False
