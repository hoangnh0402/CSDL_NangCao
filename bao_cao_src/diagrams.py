import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Rectangle, Polygon, FancyArrowPatch, Circle
import os

OUT = 'figs'
os.makedirs(OUT, exist_ok=True)
plt.rcParams['font.family'] = 'Times New Roman'
INK = '#111111'
MID = '#555555'
HEAD = '#E4E4E4'
SOFT = '#F4F4F4'


S = 0.8  # tỷ lệ canvas -> inch thực khi chèn vào báo cáo


def canvas(w, h, y0=0.0):
    fig = plt.figure(figsize=(w * S, (h - y0) * S), dpi=260)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, w)
    ax.set_ylim(y0, h)
    ax.axis('off')
    return fig, ax


def save(fig, name):
    fig.savefig(os.path.join(OUT, name), dpi=260, facecolor='white')
    plt.close(fig)


def cls_box(ax, x, y, w, title, lines, fs=10, mono=False, head_h=0.38, line_h=0.27, title_fs=None):
    h = head_h + line_h * len(lines) + 0.12
    ax.add_patch(Rectangle((x, y - h), w, h, fc='white', ec=INK, lw=1.1))
    ax.add_patch(Rectangle((x, y - head_h), w, head_h, fc=HEAD, ec=INK, lw=1.1))
    ax.text(x + w / 2, y - head_h / 2, title, ha='center', va='center', fontsize=title_fs or fs + 0.5,
            fontweight='bold', color=INK)
    for i, l in enumerate(lines):
        ax.text(x + 0.1, y - head_h - 0.06 - line_h * (i + 0.5), l, ha='left', va='center', fontsize=fs,
                color=INK, family='Consolas' if mono else 'Times New Roman')
    return (x, y - h, w, h)


def arrow(ax, p1, p2, text=None, style='-|>', ls='-', fs=9, rad=0.0, toff=(0, 0.12), lw=1.1):
    a = FancyArrowPatch(p1, p2, arrowstyle=style, mutation_scale=12, color=INK, lw=lw, linestyle=ls,
                        connectionstyle=f'arc3,rad={rad}', shrinkA=0, shrinkB=0)
    ax.add_patch(a)
    if text:
        mx, my = (p1[0] + p2[0]) / 2 + toff[0], (p1[1] + p2[1]) / 2 + toff[1]
        ax.text(mx, my, text, ha='center', va='bottom', fontsize=fs, color=INK,
                bbox=dict(fc='white', ec='none', pad=0.5))


# ------------------------------------------------------------------ ER
def fig_er():
    fig, ax = canvas(7.4, 4.6, y0=0.5)
    cls_box(ax, 0.2, 4.35, 1.75, 'NHÀ SẢN XUẤT', ['maker (PK)'])
    cls_box(ax, 3.25, 4.5, 1.95, 'SẢN PHẨM', ['model (PK)', 'maker (FK)', 'type'])
    # relationship diamond
    dx, dy = 2.6, 4.05
    ax.add_patch(Polygon([[dx - 0.5, dy], [dx, dy + 0.3], [dx + 0.5, dy], [dx, dy - 0.3]], fc=SOFT, ec=INK, lw=1.1))
    ax.text(dx, dy, 'sản xuất', ha='center', va='center', fontsize=8)
    ax.plot([1.95, dx - 0.5], [dy, dy], color=INK, lw=1.1)
    ax.plot([dx + 0.5, 3.25], [dy, dy], color=INK, lw=1.1)
    ax.text(1.98, dy + 0.06, '1', fontsize=9.5)
    ax.text(3.12, dy + 0.06, 'N', fontsize=9.5)
    # ISA triangle
    tx, ty = 4.22, 2.95
    ax.plot([tx, tx], [3.38, ty + 0.0], color=INK, lw=1.1)
    ax.add_patch(Polygon([[tx, ty], [tx - 0.32, ty - 0.45], [tx + 0.32, ty - 0.45]], fc=SOFT, ec=INK, lw=1.1))
    ax.text(tx, ty - 0.3, 'ISA', ha='center', va='center', fontsize=8.5, fontweight='bold')
    ax.text(tx + 0.42, ty - 0.18, 'type = pc | laptop | printer', fontsize=8.5, color=MID, style='italic')
    # children
    by = ty - 0.45
    ax.plot([1.15, 6.4], [by - 0.25, by - 0.25], color=INK, lw=1.1)
    ax.plot([tx, tx], [by, by - 0.25], color=INK, lw=1.1)
    kids = [(0.25, 'PC', ['model (PK, FK)', '(không có dữ liệu', ' chi tiết)']),
            (2.95, 'LAPTOP', ['model (PK, FK)', 'speed, ram, hd', 'screen, price']),
            (5.4, 'MÁY IN (PRINTER)', ['model (PK, FK)', 'color, type', 'price'])]
    for x, t, l in kids:
        w = 1.9 if t != 'MÁY IN (PRINTER)' else 1.95
        ax.plot([x + w / 2, x + w / 2], [by - 0.25, by - 0.55], color=INK, lw=1.1)
        cls_box(ax, x, by - 0.55, w, t, l, fs=9.5)
    save(fig, 'h1_1_er.png')


# ------------------------------------------------------------------ embedded vs reference
def json_box(ax, x, y, w, title, lines, fs=8.6):
    return cls_box(ax, x, y, w, title, lines, fs=fs, mono=True, head_h=0.36, line_h=0.235)


def fig_embedded():
    fig, ax = canvas(7.4, 3.6)
    json_box(ax, 0.25, 3.45, 3.4, 'Phương án N1: nhúng theo sản phẩm', [
        '// collection products',
        '{ maker: "E", model: 2001,',
        '  type: "laptop",',
        '  specs: { speed: 2.00, ram: 2048,',
        '           hd: 240, screen: 20.1 },',
        '  price: 3673 }',
        '{ maker: "E", model: 3001,',
        '  type: "printer",',
        '  specs: { color: true,',
        '           type: "ink-jet" },',
        '  price: 99 }'])
    json_box(ax, 3.85, 3.45, 3.3, 'Phương án N2: nhúng theo nhà SX', [
        '// collection makers',
        '{ _id: "E",',
        '  products: [',
        '    { model: 1011, type: "pc" },',
        '    { model: 2001, type: "laptop",',
        '      specs: {...}, price: 3673 },',
        '    { model: 3001, type: "printer",',
        '      specs: {...}, price: 99 },',
        '    ... (9 phần tử)',
        '  ] }'])
    save(fig, 'h1_2_embedded.png')


def fig_reference():
    fig, ax = canvas(7.4, 3.0)
    b1 = json_box(ax, 2.5, 2.9, 2.4, 'products', ['{ maker: "E",', '  model: 2001,', '  type: "laptop" }'])
    b2 = json_box(ax, 0.2, 1.75, 2.6, 'laptops', ['{ model: 2001,', '  speed: 2.00, ram: 2048,', '  hd: 240, screen: 20.1,', '  price: 3673 }'])
    b3 = json_box(ax, 4.65, 1.75, 2.55, 'printers', ['{ model: 3001,', '  color: true,', '  type: "ink-jet",', '  price: 99 }'])
    arrow(ax, (2.0, 1.75), (2.55, 2.05), None, style='-|>')
    arrow(ax, (5.4, 1.75), (4.85, 2.05), None, style='-|>')
    ax.text(1.95, 2.05, 'model → model', fontsize=8.5, ha='right', color=MID, style='italic')
    ax.text(5.45, 2.05, 'model → model', fontsize=8.5, ha='left', color=MID, style='italic')
    save(fig, 'h1_3_reference.png')


def fig_model():
    fig, ax = canvas(7.4, 3.2)
    json_box(ax, 0.1, 3.05, 3.65, 'products  (collection chính)', [
        '{ _id: ObjectId,',
        '  maker: String,      // NSX',
        '  model: Number,      // duy nhất',
        '  type: "pc"|"laptop"|"printer",',
        '  specs: {            // nhúng',
        '    speed, ram, hd, screen (laptop)',
        '    color, type          (printer)',
        '  },',
        '  price: Number }     // laptop, printer'], fs=8.4)
    json_box(ax, 4.75, 3.05, 2.55, 'makers  (collection phụ)', [
        '{ _id: String,  // maker',
        '  products: [   // mảng',
        '    { model: Number,',
        '      type: String },',
        '    ...',
        '  ] }'], fs=8.4)
    arrow(ax, (3.77, 2.45), (4.73, 2.45), None)
    ax.text(4.25, 2.52, 'maker → _id', ha='center', va='bottom', fontsize=8)
    arrow(ax, (4.73, 1.75), (3.77, 1.75), None)
    ax.text(4.25, 1.82, 'products.model', ha='center', va='bottom', fontsize=8)
    ax.text(4.25, 1.62, '→ model', ha='center', va='top', fontsize=8)
    ax.text(3.7, 0.15, 'specs: embedded document (quan hệ 1–1)          products[ ]: mảng tham chiếu (quan hệ 1–N)',
            ha='center', fontsize=9, color=MID, style='italic')
    save(fig, 'h1_4_model.png')


# ------------------------------------------------------------------ pipeline
def fig_pipeline():
    fig, ax = canvas(7.4, 1.9)
    stages = [('products', '30 document'), ('$match', 'type = "laptop"\n10 document'),
              ('$group', 'theo maker\n5 nhóm'), ('$project', 'làm tròn giaTB\n5 document'),
              ('$sort', 'giaTB giảm dần\n5 document')]
    w, gap, x = 1.2, 0.26, 0.12
    for i, (t, d) in enumerate(stages):
        fc = HEAD if i == 0 else 'white'
        ax.add_patch(FancyBboxPatch((x, 0.55), w, 0.95, boxstyle='round,pad=0.02,rounding_size=0.08', fc=fc, ec=INK, lw=1.1))
        ax.text(x + w / 2, 1.27, t, ha='center', va='center', fontsize=10.5, fontweight='bold',
                family='Consolas' if t.startswith('$') else 'Times New Roman')
        ax.text(x + w / 2, 0.86, d, ha='center', va='center', fontsize=8, linespacing=1.2)
        if i < len(stages) - 1:
            arrow(ax, (x + w + 0.02, 1.02), (x + w + gap - 0.02, 1.02))
        x += w + gap
    ax.text(3.7, 0.22, 'Dữ liệu đi qua lần lượt từng stage; đầu ra của stage trước là đầu vào của stage sau',
            ha='center', fontsize=9, color=MID, style='italic')
    save(fig, 'h2_1_pipeline.png')


# ------------------------------------------------------------------ replica set
def node(ax, x, y, name, role, w=1.7, h=0.95, fc='white', dashed=False):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle='round,pad=0.02,rounding_size=0.1', fc=fc, ec=INK,
                                lw=1.3 if role == 'PRIMARY' else 1.0, linestyle='--' if dashed else '-'))
    ax.text(x + w / 2, y + h * 0.66, name, ha='center', va='center', fontsize=10.5, fontweight='bold')
    ax.text(x + w / 2, y + h * 0.3, role, ha='center', va='center', fontsize=9)


def fig_rs():
    fig, ax = canvas(7.4, 3.7)
    ax.add_patch(FancyBboxPatch((2.55, 3.05), 2.3, 0.5, boxstyle='round,pad=0.02,rounding_size=0.08', fc=SOFT, ec=INK))
    ax.text(3.7, 3.3, 'Ứng dụng / mongosh', ha='center', va='center', fontsize=10)
    node(ax, 2.85, 1.75, 'mongo1:27017', 'PRIMARY\npriority = 2', fc=HEAD)
    node(ax, 0.3, 0.25, 'mongo2:27017', 'SECONDARY\npriority = 1')
    node(ax, 5.4, 0.25, 'mongo3:27017', 'SECONDARY\npriority = 1')
    arrow(ax, (3.7, 3.03), (3.7, 2.72), 'đọc / ghi', style='<|-|>', fs=8.5, toff=(0.45, -0.1))
    arrow(ax, (2.83, 1.95), (1.6, 1.22), 'sao chép oplog', fs=8.5, toff=(-0.45, 0.0))
    arrow(ax, (4.57, 1.95), (5.8, 1.22), 'sao chép oplog', fs=8.5, toff=(0.45, 0.0))
    arrow(ax, (2.02, 0.6), (5.38, 0.6), 'heartbeat (2 giây/lần)', style='<|-|>', ls='--', fs=8.5, toff=(0, 0.04))
    ax.text(0.3, 3.3, 'Replica Set: rs0', fontsize=11, fontweight='bold')
    save(fig, 'h3_1_replica_set.png')


def fig_failover():
    fig, ax = canvas(7.4, 2.55)
    panels = [('(a) Bình thường', ['PRIMARY', 'SECONDARY', 'SECONDARY'], [HEAD, 'white', 'white'], [False] * 3),
              ('(b) mongo1 dừng → bầu chọn', ['không truy cập', 'PRIMARY mới', 'SECONDARY'], [SOFT, HEAD, 'white'], [True, False, False]),
              ('(c) mongo1 khởi động lại', ['PRIMARY', 'SECONDARY', 'SECONDARY'], [HEAD, 'white', 'white'], [False] * 3)]
    for i, (t, roles, fcs, dash) in enumerate(panels):
        x0 = 0.15 + i * 2.45
        ax.add_patch(Rectangle((x0, 0.15), 2.3, 2.25, fc='white', ec=MID, lw=0.8))
        ax.text(x0 + 1.15, 2.17, t, ha='center', va='center', fontsize=9.5, fontweight='bold')
        for j, (r, fc, d) in enumerate(zip(roles, fcs, dash)):
            y = 1.55 - j * 0.6
            node(ax, x0 + 0.2, y, f'mongo{j + 1}', r, w=1.9, h=0.48, fc=fc, dashed=d)
    arrow(ax, (2.47, 1.25), (2.58, 1.25))
    arrow(ax, (4.92, 1.25), (5.03, 1.25))
    save(fig, 'h3_2_failover.png')


def fig_sharded():
    fig, ax = canvas(7.4, 4.5)
    ax.add_patch(FancyBboxPatch((2.65, 3.85), 2.1, 0.45, boxstyle='round,pad=0.02,rounding_size=0.08', fc=SOFT, ec=INK))
    ax.text(3.7, 4.075, 'Ứng dụng / mongosh', ha='center', va='center', fontsize=10)
    ax.add_patch(FancyBboxPatch((2.75, 2.85), 1.9, 0.6, boxstyle='round,pad=0.02,rounding_size=0.08', fc=HEAD, ec=INK, lw=1.3))
    ax.text(3.7, 3.22, 'mongos', ha='center', va='center', fontsize=11, fontweight='bold')
    ax.text(3.7, 2.98, 'bộ định tuyến – cổng 27017', ha='center', va='center', fontsize=8.5)
    arrow(ax, (3.7, 3.83), (3.7, 3.47), style='<|-|>')
    # config servers
    ax.add_patch(Rectangle((5.25, 2.6), 2.0, 1.55, fc='white', ec=INK, lw=1.0, linestyle='--'))
    ax.text(6.25, 3.95, 'Config Server (cfgrs)', ha='center', fontsize=9.5, fontweight='bold')
    for k in range(3):
        ax.add_patch(FancyBboxPatch((5.4, 3.45 - k * 0.37), 1.7, 0.3, boxstyle='round,pad=0.01,rounding_size=0.05', fc='white', ec=INK, lw=0.9))
        ax.text(6.25, 3.6 - k * 0.37, f'cfgsvr{k + 1}:27019', ha='center', va='center', fontsize=8.5)
    arrow(ax, (4.67, 3.15), (5.23, 3.15), 'metadata', style='<|-|>', fs=8, toff=(0, 0.04))
    # shards
    for i, (name, zone, docs) in enumerate([('shard1rs', 'Zone NSX_A_D: maker thuộc [MinKey, "E")', '16 document (A, B, C, D) + makers'),
                                            ('shard2rs', 'Zone NSX_E_H: maker thuộc ["E", MaxKey]', '14 document (E, F, G, H)')]):
        x0 = 0.2 + i * 3.6
        ax.add_patch(Rectangle((x0, 0.2), 3.4, 2.2, fc='white', ec=INK, lw=1.1))
        ax.text(x0 + 1.7, 2.2, f'Shard {i + 1}: Replica Set {name}', ha='center', fontsize=10, fontweight='bold')
        ax.text(x0 + 1.7, 1.93, zone, ha='center', fontsize=8.5, style='italic')
        for k, r in enumerate(['PRIMARY', 'SECONDARY', 'SECONDARY']):
            nx = x0 + 0.12 + k * 1.08
            ax.add_patch(FancyBboxPatch((nx, 0.85), 1.0, 0.75, boxstyle='round,pad=0.01,rounding_size=0.07',
                                        fc=HEAD if k == 0 else 'white', ec=INK, lw=1.0))
            ax.text(nx + 0.5, 1.37, f'shard{i + 1}{"abc"[k]}', ha='center', va='center', fontsize=9, fontweight='bold')
            ax.text(nx + 0.5, 1.07, r, ha='center', va='center', fontsize=7.5)
        ax.text(x0 + 1.7, 0.45, docs, ha='center', fontsize=9)
    arrow(ax, (3.2, 2.83), (1.9, 2.42), style='<|-|>')
    arrow(ax, (4.2, 2.83), (5.5, 2.42), style='<|-|>')
    save(fig, 'h3_3_sharded.png')


def fig_distribution():
    makers = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    counts = [6, 4, 1, 5, 9, 2, 1, 2]
    shard = ['shard1rs'] * 4 + ['shard2rs'] * 4
    fig = plt.figure(figsize=(5.6, 2.9), dpi=260)
    ax = fig.add_axes([0.09, 0.17, 0.89, 0.72])
    c1, c2 = '#3A3A3A', '#B5B5B5'
    for i, (m, c, s) in enumerate(zip(makers, counts, shard)):
        ax.bar(i, c, width=0.62, color=c1 if s == 'shard1rs' else c2, edgecolor='white', linewidth=2,
               hatch='' if s == 'shard1rs' else '////', zorder=3)
        ax.text(i, c + 0.15, str(c), ha='center', va='bottom', fontsize=10, color=INK)
    ax.set_xticks(range(8), makers, fontsize=10)
    ax.set_xlabel('Nhà sản xuất (maker)', fontsize=10)
    ax.set_ylabel('Số document', fontsize=10)
    ax.set_ylim(0, 10.5)
    ax.yaxis.grid(True, color='#DDDDDD', lw=0.7, zorder=0)
    for sp in ['top', 'right']:
        ax.spines[sp].set_visible(False)
    ax.spines['left'].set_color('#888888')
    ax.spines['bottom'].set_color('#888888')
    ax.axvline(3.5, color=MID, lw=1, ls='--')
    ax.text(1.5, 9.9, 'shard1rs – 16 document', ha='center', fontsize=10, fontweight='bold')
    ax.text(5.5, 9.9, 'shard2rs – 14 document', ha='center', fontsize=10, fontweight='bold')
    from matplotlib.patches import Patch
    ax.legend(handles=[Patch(fc=c1, label='shard1rs (zone NSX_A_D)'), Patch(fc=c2, hatch='////', label='shard2rs (zone NSX_E_H)')],
              loc='upper center', bbox_to_anchor=(0.5, -0.2), ncol=2, frameon=False, fontsize=9)
    ax.set_position([0.1, 0.29, 0.88, 0.63])
    save(fig, 'h3_4_distribution.png')


if __name__ == '__main__':
    fig_er(); fig_embedded(); fig_reference(); fig_model(); fig_pipeline()
    fig_rs(); fig_failover(); fig_sharded(); fig_distribution()
    print(sorted(os.listdir(OUT)))
