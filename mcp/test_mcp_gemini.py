#!/usr/bin/env python3
"""
Test: Gemini + MCP Server Compatibility
Simple unified script to test if Gemini can use your local MCP Server
"""

import os
import sys
import json
import requests
import re
import shutil
from datetime import datetime
from pathlib import Path

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Load .env file
def load_env():
    """Load environment variables from .env file"""
    env_path = Path(__file__).parent / '.env'
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()

load_env()

try:
    from colorama import Fore, Style, init
    init(autoreset=True)
    HAS_COLOR = True
except ImportError:
    HAS_COLOR = False
    class Fore:
        GREEN = ''
        RED = ''
        YELLOW = ''
        CYAN = ''
    class Style:
        RESET_ALL = ''

import google.genai as genai

MCP_URL = "http://localhost:3000"
TEST_DATA_DIR = "data/test"

class Color:
    """Simple color management"""
    OK = Fore.GREEN if HAS_COLOR else ''
    ERROR = Fore.RED if HAS_COLOR else ''
    WARN = Fore.YELLOW if HAS_COLOR else ''
    INFO = Fore.CYAN if HAS_COLOR else ''
    BOLD = Fore.CYAN if HAS_COLOR else ''
    RESET = Style.RESET_ALL if HAS_COLOR else ''


class GeminiMCP:
    """Gemini + MCP Server integration"""
    
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv("AI_API_KEY")
        if not self.api_key:
            raise ValueError("AI_API_KEY not found in .env or environment")
        
        self.client = genai.Client(api_key=self.api_key)
        self.calls = []
        self.files_created = []
        
        # Setup test directory
        self.setup_test_dir()
    
    def setup_test_dir(self):
        """Setup clean test directory"""
        test_path = Path(TEST_DATA_DIR)
        if test_path.exists():
            shutil.rmtree(test_path)
        test_path.mkdir(parents=True, exist_ok=True)
    
    def _print_header(self, text):
        """Print formatted header"""
        print(f"\n{Color.BOLD}{text}{Color.RESET}")
    
    def _print_success(self, msg):
        print(f"{Color.OK}[OK]{Color.RESET} {msg}")
    
    def _print_error(self, msg):
        print(f"{Color.ERROR}[ERROR]{Color.RESET} {msg}")
    
    def _print_info(self, msg):
        print(f"{Color.INFO}[INFO]{Color.RESET} {msg}")
    
    def _print_warn(self, msg):
        print(f"{Color.WARN}[WARN]{Color.RESET} {msg}")
    
    def setup_test_dir(self):
        """Setup clean test directory"""
        test_path = Path(TEST_DATA_DIR)
        if test_path.exists():
            shutil.rmtree(test_path)
        test_path.mkdir(parents=True, exist_ok=True)
    
    def mcp_call(self, tool_name, params):
        """Execute MCP tool"""
        # Add test directory prefix to file_path (except for reading existing files)
        if 'file_path' in params and not params['file_path'].startswith('/'):
            # Only skip prefix if we're reading an existing file from data/
            if tool_name == 'read_pdf' and Path(f"data/{params['file_path']}").exists():
                # Keep original path for reading existing PDFs
                pass
            elif not params['file_path'].startswith('test/'):
                # Add test prefix only if not already present
                params['file_path'] = f"test/{params['file_path']}"
        
        print(f"  {Color.INFO}>>> {tool_name}{Color.RESET}", end=" ")
        try:
            response = requests.post(
                f"{MCP_URL}/tools/{tool_name}",
                json=params,
                timeout=30
            )
            result = response.json()
            
            self.calls.append({
                'tool': tool_name,
                'params': params,
                'time': datetime.now().isoformat(),
                'success': result.get('success', False)
            })
            
            if result.get('success'):
                print(f"{Color.OK}OK{Color.RESET}")
                if tool_name == 'append_to_file':
                    file_path = result.get('result', {}).get('file_path', '')
                    if file_path:
                        self.files_created.append(file_path)
                elif tool_name == 'fetch_url_content':
                    results = result.get('result', {}).get('results', [])
                    print(f"       Found {len(results)} sources")
            else:
                print(f"{Color.WARN}WARN{Color.RESET}")
            
            return result
        except Exception as e:
            print(f"{Color.ERROR}ERROR{Color.RESET}")
            self.calls.append({
                'tool': tool_name,
                'params': params,
                'time': datetime.now().isoformat(),
                'success': False
            })
            return {'success': False, 'error': str(e)}
    
    def test_mcp_health(self):
        """Test 1: MCP Server is running"""
        self._print_header("1. MCP Server Health")
        try:
            resp = requests.get(f"{MCP_URL}/health", timeout=5)
            self._print_success("MCP running on port 3000")
            return True
        except Exception as e:
            self._print_error(f"MCP not accessible")
            return False
    
    def test_gemini_connection(self):
        """Test 2: Gemini API works"""
        self._print_header("2. Gemini API Connection")
        try:
            response = self.client.models.generate_content(
                model="gemini-2.0-flash",
                contents="Say hello"
            )
            self._print_success("Gemini API connected")
            return True
        except Exception as e:
            self._print_error(f"Gemini API: {str(e)[:50]}")
            return False
    
    def test_tool_fetch_url(self):
        """Test 3: fetch_url_content"""
        self._print_header("2. Tool: fetch_url_content")
        result = self.mcp_call("fetch_url_content", {
            "search_query": "machine learning",
            "max_results": 2,
            "fetch_content": False
        })
        return result.get('success', False)
    
    def test_tool_append_file(self):
        """Test 3: append_to_file"""
        self._print_header("3. Tool: append_to_file")
        result = self.mcp_call("append_to_file", {
            "file_path": "test_output.md",
            "content": f"# Test\nDate: {datetime.now().isoformat()}\n"
        })
        return result.get('success', False)
    
    def test_tool_read_pdf(self):
        """Test 4: read_pdf"""
        self._print_header("4. Tool: read_pdf")
        result = self.mcp_call("read_pdf", {
            "file_path": "methodologie.pdf"
        })
        return result.get('success', False)
    
    def test_gemini_uses_mcp(self):
        """Test 5: Gemini can request MCP tools"""
        self._print_header("5. Gemini + MCP Integration")
        
        prompt = """Use these tools:
- USE_MCP[fetch_url_content]{"search_query":"Python","max_results":2}
- USE_MCP[append_to_file]{"file_path":"result.md","content":"Done"}

Search and save."""
        
        try:
            self._print_info("Calling Gemini")
            response = self.client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )
            resp_text = response.text
            
            if "USE_MCP[" in resp_text:
                self._print_info(f"Gemini requested tools")
                self._parse_and_execute_tools(resp_text)
                return True
            else:
                self._print_warn("Gemini didn't request tools")
                return False
        except Exception as e:
            self._print_error(f"Gemini: {str(e)[:40]}")
            return False
    
    def test_force_all_tools(self):
        """Test 7: Generate complete thesis"""
        self._print_header("7. Generate Complete Thesis")
        
        self._print_info("Step 1: Reading methodology PDF")
        methodology = self.mcp_call("read_pdf", {
            "file_path": "methodologie.pdf"
        })
        
        if not methodology.get('success'):
            self._print_error("Failed to read methodology")
            return False
        
        method_text = methodology.get('result', {}).get('text', '') # [:2000] Limit pcq trop long flemme
        self._print_info(f"Methodology loaded ({len(method_text)} chars)")
        
        self._print_info("Step 2: Searching web for content")
        web_content = self.mcp_call("fetch_url_content", {
            "search_query": "artificial intelligence healthcare applications 2024",
            "max_results": 5,
            "fetch_content": True
        })
        
        search_failed = False
        if not web_content.get('success'):
            search_failed = True
            self._print_warn("Web search returned no results")
            web_text = ""
            web_results = []
        else:
            result_data = web_content.get('result', {})
            results = result_data.get('results', [])
            search_success = result_data.get('search_success', len(results) > 0)
            
            if not search_success or len(results) == 0:
                search_failed = True
                self._print_warn("Search engines unavailable")
                web_text = ""
                web_results = []
            else:
                sources_list = []
                web_text_parts = ["AVAILABLE SOURCES:"]
                
                for i, r in enumerate(results, 1):
                    title = r.get('title', f'Source {i}')
                    url = r.get('url', '')
                    content_snippet = r.get('content', '')[:300]
                    
                    sources_list.append({
                        'number': i,
                        'title': title,
                        'url': url
                    })
                    
                    web_text_parts.append(f"\n[{i}] Title: {title}")
                    web_text_parts.append(f"URL: {url}")
                    web_text_parts.append(f"Snippet: {content_snippet[:200]}...")
                
                web_text = "\n".join(web_text_parts)
                web_results = results
                self._print_info(f"Web content gathered from {len(results)} sources")
        
        self._print_info("Saving research results to JSON")
        self.mcp_call("append_to_file", {
            "file_path": "test/web_research.json",
            "content": json.dumps(web_results, indent=2, ensure_ascii=False)
        })
        
        if search_failed:
            self._print_error("Cannot generate thesis: no web sources available")
            self._print_info("Configure SEARXNG_URL or BRAVE_API_KEY in .env")
            return False
        
        self._print_info("Step 3: Generating thesis with Gemini")
        
        # Varied thesis topics to avoid repetition
        topics = [
            "Artificial Intelligence in Healthcare: Current Applications and Challenges",
            "Machine Learning Approaches to Medical Diagnosis and Treatment",
            "Ethical Considerations in AI-Powered Healthcare Systems",
            "Deep Learning for Personalized Medicine and Drug Discovery",
            "AI Implementation Barriers in Clinical Practice Settings"
        ]
        import random
        selected_topic = random.choice(topics)
        
        prompt = f"""You are writing CHAPTER 1 of a master's thesis.

RESEARCH SOURCES YOU MUST CITE:
{web_text}

TOPIC: {selected_topic}

CRITICAL REQUIREMENTS:
1. Start with: # Chapter 1: {selected_topic}
2. Use proper Markdown headers: ## for sections, ### for subsections
3. Minimum 2000 words
4. CITE SOURCES USING NUMBERS: [1], [2], [3], etc. matching the source list above
5. Example: "AI improves diagnostic accuracy by 15% [2], according to recent research [4]."
6. Must include at least 12 citations from the numbered sources
7. Distribute citations throughout all sections

STRUCTURE (use exactly these headers):
## 1.1 Introduction and Context (400 words)
## 1.2 Theoretical Foundations (500 words)  
## 1.3 Literature Review (700 words) - with many citations [1], [2], etc.
## 1.4 Current State of Research (300 words) - with citations
## 1.5 Problem Statement and Objectives (100 words)

## References
List all sources using format: [1] Title, URL

Write in academic style, comprehensive and detailed.
USE NUMBERED CITATIONS [1], [2], [3] etc. NOT placeholder text."""
        
        try:
            response = self.client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )
            thesis_content = response.text
            
            self._print_info(f"Topic: {selected_topic}")
            self._print_info(f"Thesis generated ({len(thesis_content)} chars)")
            
            self._print_info("Step 4: Saving thesis as PDF")
            pdf_result = self.mcp_call("generate_pdf", {
                "file_path": "test/complete_thesis.pdf",
                "content": thesis_content,
                "title": f"Master Thesis: {selected_topic}"
            })
            
            # Save metadata
            metadata = {
                "generated_at": datetime.now().isoformat(),
                "methodology_source": "methodologie.pdf",
                "web_sources_count": len(web_results),
                "thesis_length": len(thesis_content),
                "thesis_words": len(thesis_content.split()),
                "pdf_format": pdf_result.get('result', {}).get('format', 'unknown'),
                "pdf_size": pdf_result.get('result', {}).get('size', 0)
            }
            self.mcp_call("append_to_file", {
                "file_path": "test/thesis_metadata.json",
                "content": json.dumps(metadata, indent=2, ensure_ascii=False)
            })
            
            if pdf_result.get('success'):
                self._print_success("Complete thesis generated as PDF!")
                self._print_info(f"Check data/test/ for all results")
                return True
            else:
                self._print_error("Failed to save thesis as PDF")
                return False
                
        except Exception as e:
            self._print_error(f"Generation failed: {str(e)[:50]}")
            return False
    
    def _parse_and_execute_tools(self, response_text):
        """Parse USE_MCP[] and execute tools"""
        pattern = r'USE_MCP\[(\w+)\](\{[^}]+\})'
        matches = re.findall(pattern, response_text)
        
        if matches:
            print(f"       {len(matches)} tool(s) found")
            for tool_name, params_str in matches:
                try:
                    params = json.loads(params_str)
                    self.mcp_call(tool_name, params)
                except Exception as e:
                    pass
    
    def print_summary(self):
        """Print test summary"""
        self._print_header("Summary")
        
        total_calls = len(self.calls)
        successful = sum(1 for c in self.calls if c['success'])
        tools_used = set(c['tool'] for c in self.calls)
        
        print(f"MCP calls: {successful}/{total_calls}")
        print(f"Tools: {', '.join(sorted(tools_used)) if tools_used else 'none'}")
        print(f"Test dir: {TEST_DATA_DIR}")
        
        # Check files in test directory
        test_path = Path(TEST_DATA_DIR)
        if test_path.exists():
            files = list(test_path.glob('*'))
            print(f"Files created: {len(files)}")
            for f in files:
                size = f.stat().st_size
                print(f"  - {f.name} ({size} bytes)")
        
        if successful > 0:
            self._print_success(f"Gemini used MCP ({successful} calls)")
        else:
            self._print_warn("No MCP calls made")


def main():
    """Run all tests"""
    
    print(f"\n{Color.BOLD}GEMINI + MCP SERVER TEST{Color.RESET}\n")
    
    try:
        tester = GeminiMCP()
    except ValueError as e:
        print(f"{Color.ERROR}[FATAL]{Color.RESET} {e}")
        sys.exit(1)
    
    # Run tests
    tests = [
        ("MCP Server Health", tester.test_mcp_health),
        ("fetch_url_content", tester.test_tool_fetch_url),
        ("append_to_file", tester.test_tool_append_file),
        ("read_pdf", tester.test_tool_read_pdf),
        ("Gemini + MCP", tester.test_gemini_uses_mcp),
        ("Generate Thesis", tester.test_force_all_tools),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            passed = test_func()
            results.append((name, passed))
        except Exception as e:
            results.append((name, False))
    
    # Print summary
    tester.print_summary()
    
    # Print results
    print(f"\n{Color.BOLD}Results:{Color.RESET}")
    for name, passed in results:
        status = f"{Color.OK}PASS{Color.RESET}" if passed else f"{Color.ERROR}FAIL{Color.RESET}"
        print(f"  {status} - {name}")
    
    passed_count = sum(1 for _, p in results if p)
    total_count = len(results)
    print(f"\n{passed_count}/{total_count} passed\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Color.WARN}[INTERRUPTED]{Color.RESET} Test stopped by user")
    except Exception as e:
        print(f"\n{Color.ERROR}[FATAL]{Color.RESET} {e}")
        sys.exit(1)
