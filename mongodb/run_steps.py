"""Chạy các bước lệnh mongosh/shell trong file kịch bản và lưu kết quả thực tế.

Định dạng kịch bản:
  //## SESSION <tên> | <container> | <uri>     -> mở phiên mongosh mới trong container
  //## SHELL                                     -> các bước sau là lệnh shell (bash)
  //@@ <id>                                      -> bắt đầu một bước (id bắt đầu bằng '_' là bước ẩn)
Kết quả ghi vào results/<file>.json
"""
import json, re, subprocess, sys, os, shutil

# Trên Windows, 'bash' có thể trỏ tới WSL; ưu tiên Git Bash nếu có
GIT_BASH = r'C:\Program Files\Git\bin\bash.exe'
BASH = GIT_BASH if os.path.exists(GIT_BASH) else (shutil.which('bash') or 'bash')

PROMPT_RE = re.compile(r'^((?:\S+ )?\[[^\]]*\] [\w.-]+> |[\w.-]+> )')


def parse(path):
    groups, cur, step = [], None, None
    for line in open(path, encoding='utf-8').read().splitlines():
        if line.startswith('//## SESSION'):
            name, container, uri = [s.strip() for s in line[len('//## SESSION'):].split('|')]
            cur = {'kind': 'mongosh', 'name': name, 'container': container, 'uri': uri, 'steps': []}
            groups.append(cur)
        elif line.startswith('//## SHELL'):
            cur = {'kind': 'shell', 'name': 'shell', 'steps': []}
            groups.append(cur)
        elif line.startswith('//@@'):
            step = {'id': line[4:].strip(), 'lines': []}
            cur['steps'].append(step)
        elif step is not None:
            step['lines'].append(line)
    for g in groups:
        for s in g['steps']:
            while s['lines'] and not s['lines'][-1].strip():
                s['lines'].pop()
            s['command'] = '\n'.join(s['lines'])
            del s['lines']
    return groups


def run_mongosh(g):
    script = []
    for s in g['steps']:
        script.append(f'print("@@STEP:{s["id"]}@@")')
        script.append(' '.join(l.strip() for l in s['command'].splitlines() if l.strip()))
    script.append('print("@@STEP:__end__@@")')
    p = subprocess.run(['docker', 'exec', '-i', g['container'], 'mongosh', '--quiet', g['uri']],
                       input='\n'.join(script) + '\n', capture_output=True, text=True, encoding='utf-8')
    out = p.stdout
    g['raw'] = out
    parts = re.split(r'@@STEP:([^@]+)@@\n', out)
    res, prompts = {}, {}
    for i in range(1, len(parts) - 1, 2):
        sid, body = parts[i], parts[i + 1]
        cleaned, prompt = [], ''
        for line in body.split('\n'):
            m = PROMPT_RE.match(line)
            if m:
                if not prompt:
                    prompt = m.group(1)
                line = line[len(m.group(1)):]
                if not line.strip():
                    continue
            cleaned.append(line)
        while cleaned and not cleaned[0].strip():
            cleaned.pop(0)
        res[sid] = '\n'.join(cleaned).rstrip()
        prompts[sid] = prompt.rstrip()
    for s in g['steps']:
        s['output'] = res.get(s['id'], '')
        s['prompt'] = prompts.get(s['id'], '')
    if p.stderr.strip():
        g['stderr'] = p.stderr


def run_shell(g):
    for s in g['steps']:
        p = subprocess.run([BASH, '-c', s['command']], capture_output=True, text=True, encoding='utf-8')
        s['output'] = (p.stdout + p.stderr).rstrip()


def main(path):
    groups = parse(path)
    for g in groups:
        (run_mongosh if g['kind'] == 'mongosh' else run_shell)(g)
        for s in g['steps']:
            print(f"===== [{g['name']}] {s['id']}\n{s['command']}\n----->\n{s['output']}\n")
        if g.get('stderr'):
            print('STDERR:', g['stderr'])
    os.makedirs('results', exist_ok=True)
    out = os.path.join('results', os.path.splitext(os.path.basename(path))[0] + '.json')
    json.dump(groups, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main(sys.argv[1])
