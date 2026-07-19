"""XSearchLane REST client (stdlib only)."""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Any


class XSearchLaneError(Exception):
    """Raised when the XSearchLane API returns an error response."""

    def __init__(
        self,
        message: str,
        *,
        code: str | None = None,
        status: int | None = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.status = status


class XSearchLaneClient:
    """Python client for Talocode XSearchLane (`/v1/xsearchlane/*`)."""

    def __init__(
        self,
        api_key: str | None = None,
        base_url: str | None = None,
        *,
        timeout: float = 90.0,
    ) -> None:
        self.api_key = api_key or os.environ.get("TALOCODE_API_KEY")
        self.base_url = (
            base_url
            or os.environ.get("TALOCODE_BASE_URL")
            or "https://api.talocode.site"
        ).rstrip("/")
        self.timeout = timeout

    def _resolve_path(self, path: str) -> str:
        if self.base_url.endswith("/xsearchlane") and (
            path == "/v1/xsearchlane" or path.startswith("/v1/xsearchlane/")
        ):
            rest = path[len("/v1/xsearchlane") :] or "/health"
            return rest if rest.startswith("/") else f"/{rest}"
        return path

    def _headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    def _request(
        self,
        method: str,
        path: str,
        body: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        url = f"{self.base_url}{self._resolve_path(path)}"
        data = json.dumps(body).encode("utf-8") if body is not None else None
        req = urllib.request.Request(
            url,
            data=data,
            headers=self._headers(),
            method=method,
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                raw = resp.read().decode("utf-8")
                if not raw:
                    return {}
                return json.loads(raw)
        except urllib.error.HTTPError as e:
            code: str | None = None
            msg = str(e)
            try:
                detail = json.loads(e.read().decode("utf-8"))
                if isinstance(detail, dict):
                    err = detail.get("error")
                    if isinstance(err, dict):
                        msg = err.get("message") or msg
                        code = err.get("code")
                    elif isinstance(err, str):
                        msg = err
                    code = code or detail.get("code")
            except Exception:
                pass
            raise XSearchLaneError(msg, code=code, status=e.code) from e
        except urllib.error.URLError as e:
            raise XSearchLaneError(f"Request failed: {e.reason}") from e

    def health(self) -> dict[str, Any]:
        return self._request("GET", "/v1/xsearchlane/health")

    def pricing(self) -> dict[str, Any]:
        return self._request("GET", "/v1/xsearchlane/pricing")

    def capabilities(self) -> dict[str, Any]:
        return self._request("GET", "/v1/xsearchlane/capabilities")

    def search(
        self,
        query: str | None = None,
        *,
        q: str | None = None,
        allowed_handles: list[str] | None = None,
        excluded_handles: list[str] | None = None,
        from_date: str | None = None,
        to_date: str | None = None,
        enable_image_understanding: bool | None = None,
        enable_video_understanding: bool | None = None,
    ) -> dict[str, Any]:
        body: dict[str, Any] = {}
        if query is not None:
            body["query"] = query
        if q is not None:
            body["q"] = q
        if allowed_handles is not None:
            body["allowedHandles"] = allowed_handles
        if excluded_handles is not None:
            body["excludedHandles"] = excluded_handles
        if from_date is not None:
            body["fromDate"] = from_date
        if to_date is not None:
            body["toDate"] = to_date
        if enable_image_understanding is not None:
            body["enableImageUnderstanding"] = enable_image_understanding
        if enable_video_understanding is not None:
            body["enableVideoUnderstanding"] = enable_video_understanding
        return self._request("POST", "/v1/xsearchlane/search", body)

    def research(
        self,
        query: str | None = None,
        *,
        q: str | None = None,
        allowed_handles: list[str] | None = None,
        from_date: str | None = None,
        to_date: str | None = None,
    ) -> dict[str, Any]:
        body: dict[str, Any] = {}
        if query is not None:
            body["query"] = query
        if q is not None:
            body["q"] = q
        if allowed_handles is not None:
            body["allowedHandles"] = allowed_handles
        if from_date is not None:
            body["fromDate"] = from_date
        if to_date is not None:
            body["toDate"] = to_date
        return self._request("POST", "/v1/xsearchlane/research", body)


def create_xsearchlane_client(
    api_key: str | None = None,
    base_url: str | None = None,
    *,
    timeout: float = 90.0,
) -> XSearchLaneClient:
    return XSearchLaneClient(api_key=api_key, base_url=base_url, timeout=timeout)
