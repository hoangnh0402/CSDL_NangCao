"""Dựng ảnh cửa sổ mongosh (nền trắng, chữ đen) từ kết quả chạy thực tế trong results/*.json."""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

RES = r'D:\CSDL_NangCao\mongodb\results'
OUT = 'figs'
FONT = ImageFont.truetype(r'C:\Windows\Fonts\consola.ttf', 26)
FONT_B = ImageFont.truetype(r'C:\Windows\Fonts\consolab.ttf', 26)
TITLE_F = ImageFont.truetype(r'C:\Windows\Fonts\segoeui.ttf', 24)
CW = FONT.getlength('M')
LH = 33
PAD = 22
MINCOLS = 84
WRAP = 104

_steps = {}
for f in os.listdir(RES):
    if f.endswith('.json'):
        for g in json.load(open(os.path.join(RES, f), encoding='utf-8')):
            for s in g['steps']:
                _steps[s['id']] = dict(s, kind=g['kind'])


def step(sid):
    return _steps[sid]


def trim(text, head=None, tail=None, keep=None):
    lines = text.split('\n')
    if keep:
        out = []
        for a, b in keep:
            if out:
                out.append('  ...')
            out.extend(lines[a:b])
        return out
    if head is not None and len(lines) > head + (tail or 0):
        return lines[:head] + ['  ...'] + (lines[-tail:] if tail else [])
    return lines


def wrap(line):
    out = []
    while len(line) > WRAP:
        cut = max(line.rfind(' ', 0, WRAP), line.rfind(',', 0, WRAP) + 1)
        if cut < WRAP // 2:
            cut = WRAP
        out.append(line[:cut].rstrip())
        line = '    ' + line[cut:].lstrip()
    out.append(line)
    return out


def render(name, title, items):
    """items: list of dict(id=..., cmd=None, head/tail/keep=..., out=True)"""
    rows = []  # (text, style)
    for it in items:
        s = step(it['id'])
        prompt = s.get('prompt') or ''
        if s['kind'] == 'shell':
            prompt = '$'
        cmd = it.get('cmd', s['command']).split('\n')
        first = wrap((prompt + ' ' if prompt else '') + cmd[0])
        rows.append((first[0], 'cmd', len(prompt) + 1 if prompt else 0))
        for c in first[1:]:
            rows.append((c, 'cmd', 0))
        for c in cmd[1:]:
            for w in wrap(c):
                rows.append((w, 'cmd', 0))
        if it.get('out', True):
            for l in trim(s['output'], it.get('head'), it.get('tail'), it.get('keep')):
                for w in wrap(l):
                    rows.append((w, 'out', 0))
        rows.append(('', 'out', 0))
    rows.pop()
    cols = max(MINCOLS, max(len(r[0]) for r in rows))
    W = int(PAD * 2 + cols * CW)
    TB = 44
    H = TB + PAD * 2 + LH * len(rows)
    im = Image.new('RGB', (W, H), 'white')
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W - 1, H - 1], outline='#8A8A8A', width=2)
    d.rectangle([1, 1, W - 2, TB], fill='#EDEDED')
    d.line([0, TB, W, TB], fill='#8A8A8A', width=2)
    for i, x in enumerate([22, 48, 74]):
        d.ellipse([x - 8, TB / 2 - 8, x + 8, TB / 2 + 8], outline='#7A7A7A', width=2)
    d.text((W / 2, TB / 2), title, font=TITLE_F, fill='#222222', anchor='mm')
    y = TB + PAD
    for text, style, plen in rows:
        if style == 'cmd' and plen:
            d.text((PAD, y), text[:plen], font=FONT, fill='#555555')
            d.text((PAD + plen * CW, y), text[plen:], font=FONT_B, fill='#000000')
        elif style == 'cmd':
            d.text((PAD, y), text, font=FONT_B, fill='#000000')
        else:
            d.text((PAD, y), text, font=FONT, fill='#111111')
        y += LH
    os.makedirs(OUT, exist_ok=True)
    im.save(os.path.join(OUT, name))
    return name, W, H, cols


INSERT_CMD = 'db.products.insertMany([\n  { maker: "A", model: 1001, type: "pc" },\n  ...                  // 30 document theo dữ liệu nguồn\n  { maker: "H", model: 3007, type: "printer", specs: { color: true, type: "laser" }, price: 200 }\n])'

SPECS = [
    ('t1_nhap_du_lieu.png', 'mongosh — mongo1:27017 (Replica Set rs0)', [
        dict(id='insert_products', cmd=INSERT_CMD, head=4, tail=3),
        dict(id='count_all'), dict(id='count_by_type')]),
    ('t1_rang_buoc.png', 'mongosh — mongo1:27017 (Replica Set rs0)', [
        dict(id='invalid_insert', keep=[(0, 3), (11, 22)]),
        dict(id='dup_insert')]),
    ('t1_mang.png', 'mongosh — mongo1:27017 (Replica Set rs0)', [
        dict(id='arr_elemmatch'), dict(id='arr_size'), dict(id='arr_all')]),
    ('t2_yc8.png', 'mongosh — mongo1:27017 (Replica Set rs0)', [dict(id='yc8')]),
    ('t2_yc14.png', 'mongosh — mongo1:27017 (Replica Set rs0)', [
        dict(id='yc14', cmd='db.makers.aggregate([ { $match: ... }, { $lookup: ... }, { $project: ... }, ... ])', head=22, tail=1)]),
    ('t3_rs_status.png', 'mongosh — mongo1:27017 (Replica Set rs0)', [dict(id='rs_status')]),
    ('t3_secondary.png', 'mongosh — mongo2:27017 (Replica Set rs0)', [
        dict(id='hello_secondary'), dict(id='sec_counts'), dict(id='sec_find_test'), dict(id='sec_write')]),
    ('t3_failover.png', 'Terminal & mongosh — kiểm thử chuyển đổi dự phòng', [
        dict(id='stop_mongo1'), dict(id='failover_status'), dict(id='failover_write')]),
    ('t3_recover.png', 'Terminal & mongosh — mongo1 khởi động lại', [
        dict(id='start_mongo1'), dict(id='recover_status'), dict(id='recover_data')]),
    ('t3_shard_dist.png', 'mongosh — mongos:27017 (Sharded Cluster)', [dict(id='shard_distribution', keep=[(0, 5), (7, 14), (16, 34)])]),
    ('t3_explain.png', 'mongosh — mongos:27017 (Sharded Cluster)', [
        dict(id='explain_maker_A', cmd='(e => ({ stage: ..., shards: ..., nReturned: ... }))(\n  db.products.find({ maker: "A" }).explain("executionStats"))'),
        dict(id='explain_type', cmd='(e => ({ stage: ..., shards: ..., nReturned: ..., nReturnedPerShard: ... }))(\n  db.products.find({ type: "laptop" }).explain("executionStats"))')]),
    ('t3_shard_ha.png', 'Terminal & mongosh — dừng nút Primary của shard1rs', [
        dict(id='stop_shard1a'), dict(id='ha_count'), dict(id='ha_write', keep=[(0, 1), (3, 5), (6, 7)])]),
]

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    info = {}
    for name, title, items in SPECS:
        n, W, H, cols = render(name, title, items)
        info[n] = {'w': W, 'h': H, 'cols': cols}
        print(n, W, H, cols)
    json.dump(info, open(os.path.join(OUT, 'terms.json'), 'w'), indent=1)
