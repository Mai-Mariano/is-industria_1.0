import re
import bleach
from markdown_it import MarkdownIt

md = MarkdownIt("commonmark")

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text, flags=re.UNICODE)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")

def render_md(markdown_text: str) -> str:
    html = md.render(markdown_text or "")
    # sanitize -> só tags seguras
    return bleach.clean(
        html,
        tags=["p","ul","ol","li","strong","em","a","h3","h4","blockquote","code","pre","br"],
        attributes={"a": ["href","title","target","rel"]},
        protocols=["http","https","mailto"],
        strip=True
    )
