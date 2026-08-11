import type { ManifestEntry } from "../shared/types/visualization";

export const PREGENERATED_EXAMPLE_MANIFESTS: Partial<Record<string, ManifestEntry[]>> = {
  "bubble-sort-steps": [
    {
      "variable": "data",
      "kind": "dot",
      "compatibleViewKinds": [
        "auto",
        "array_cells",
        "bar",
        "heap_dual"
      ],
      "steps": [
        {
          "stepId": "step 6",
          "timelineKey": "9:6",
          "eventOrder": 7,
          "executionId": 9,
          "order": 6,
          "index": 9,
          "meta": {
            "var_id": 7,
            "access_path": "data[j]",
            "access_paths": [
              "data[j]",
              "data[j + 1]"
            ],
            "scope_id": 0,
            "line_number": 5,
            "execution_id": 9,
            "order": 6
          },
          "dot": "digraph G {\n\tgraph [fontcolor=\"#0f172a\" fontname=Helvetica fontsize=16 label=<<font point-size='16' color='#0f172a'><b>data</b></font>> labeljust=c labelloc=t nodesep=0.006 rankdir=TB ranksep=0.06]\n\tnode [color=\"#1f2933\" fillcolor=\"#ffffff\" fontname=Helvetica shape=box style=\"rounded,filled\"]\n\tedge [color=\"#6b7280\" fontname=Helvetica]\n\tarr_exp_1 [label=\"\" height=0.01 shape=point style=invis width=0.01]\n\tarr_item_data_1_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_data_1_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">1</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>1</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-data-array-item-1-0\" penwidth=1.1 shape=plain]\n\tarr_item_data_3_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_data_3_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">3</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>0</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-data-array-item-3-0\" penwidth=1.1 shape=plain]\n\tarr_item_data_7_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_data_7_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">7</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>2</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-data-array-item-7-0\" penwidth=1.1 shape=plain]\n\tarr_exp_1 -> arr_item_data_3_0 [style=invis]\n\tarr_item_data_3_0 -> arr_item_data_1_0 [style=invis]\n\tarr_item_data_1_0 -> arr_item_data_7_0 [style=invis]\n{rank=same; arr_item_data_1_0 arr_item_data_3_0 arr_item_data_7_0 }}\n"
        }
      ]
    },
    {
      "variable": "i",
      "kind": "dot",
      "compatibleViewKinds": [
        "auto"
      ],
      "steps": [
        {
          "stepId": "step 7",
          "timelineKey": "10:7",
          "eventOrder": 9,
          "executionId": 10,
          "order": 7,
          "index": 10,
          "meta": {
            "var_id": 9,
            "access_path": "i",
            "access_paths": [
              "i"
            ],
            "scope_id": 0,
            "line_number": 2,
            "execution_id": 10,
            "order": 7
          },
          "dot": "digraph G {\n\tgraph [nodesep=0.6 rankdir=LR ranksep=0.7]\n\tnode [color=\"#1f2933\" fillcolor=\"#ffffff\" fontname=Helvetica shape=box style=\"rounded,filled\"]\n\tedge [color=\"#6b7280\" fontname=Helvetica]\n\tscalar_value [label=<<font point-size=\"12\" color=\"#0f172a\">1</font>> shape=plain]\n}\n"
        }
      ]
    },
    {
      "variable": "j",
      "kind": "dot",
      "compatibleViewKinds": [
        "auto"
      ],
      "steps": [
        {
          "stepId": "step 5",
          "timelineKey": "8:5",
          "eventOrder": 6,
          "executionId": 8,
          "order": 5,
          "index": 8,
          "meta": {
            "var_id": 6,
            "access_path": "j",
            "access_paths": [
              "j"
            ],
            "scope_id": 0,
            "line_number": 3,
            "execution_id": 8,
            "order": 5
          },
          "dot": "digraph G {\n\tgraph [nodesep=0.6 rankdir=LR ranksep=0.7]\n\tnode [color=\"#1f2933\" fillcolor=\"#ffffff\" fontname=Helvetica shape=box style=\"rounded,filled\"]\n\tedge [color=\"#6b7280\" fontname=Helvetica]\n\tscalar_value [label=<<font point-size=\"12\" color=\"#0f172a\">1</font>> shape=plain]\n}\n"
        }
      ]
    }
  ],
  "linked-list": [
    {
      "variable": "data",
      "kind": "dot",
      "compatibleViewKinds": [
        "auto",
        "linked_list"
      ],
      "steps": [
        {
          "stepId": "step 1",
          "timelineKey": "0:1",
          "eventOrder": 26,
          "executionId": 0,
          "order": 1,
          "index": 0,
          "meta": {
            "var_id": 26,
            "access_path": "data",
            "access_paths": [
              "data"
            ],
            "scope_id": 0,
            "line_number": 13,
            "execution_id": 0,
            "order": 1
          },
          "dot": "digraph G {\n\tgraph [fontcolor=\"#0f172a\" fontname=Helvetica fontsize=16 label=<<font point-size='16' color='#0f172a'><b>data [step 0]</b></font>> labeljust=c labelloc=t nodesep=0.18 rankdir=LR ranksep=0.30]\n\tnode [color=\"#1f2933\" fillcolor=\"#ffffff\" fontname=Helvetica shape=box style=\"rounded,filled\"]\n\tedge [color=\"#6b7280\" fontname=Helvetica]\n\tlinked_exp_1 [label=\"\" height=0.01 shape=point style=invis width=0.01]\n\tlinked_item_data_1_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td align='center' bgcolor='#ffffff' cellpadding='6'><font point-size=\"12\" color=\"#0f172a\">1</font></td><td align='center' bgcolor='#f8fafc' cellpadding='6'><font color='#94a3b8' point-size='10'>next</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-data-linked-item-1-0\" penwidth=1.1 shape=plain]\n\tlinked_item_data_2_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td align='center' bgcolor='#ffffff' cellpadding='6'><font point-size=\"12\" color=\"#0f172a\">2</font></td><td align='center' bgcolor='#f8fafc' cellpadding='6'><font color='#94a3b8' point-size='10'>next</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-data-linked-item-2-0\" penwidth=1.1 shape=plain]\n\tlinked_item_data_3_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td align='center' bgcolor='#ffffff' cellpadding='6'><font point-size=\"12\" color=\"#0f172a\">3</font></td><td align='center' bgcolor='#f8fafc' cellpadding='6'><font color='#94a3b8' point-size='10'>next</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-data-linked-item-3-0\" penwidth=1.1 shape=plain]\n\tlinked_tail_data [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='6'><tr><td align='center' bgcolor='#ffffff'><font color='#9ca3af'>\u2205</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-data-linked-tail\" penwidth=1.0 shape=plain]\n\tlinked_exp_1 -> linked_item_data_1_0 [style=invis]\n\tlinked_item_data_1_0 -> linked_item_data_2_0 [arrowhead=normal color=\"#6b7280\" penwidth=1.2]\n\tlinked_item_data_2_0 -> linked_item_data_3_0 [arrowhead=normal color=\"#6b7280\" penwidth=1.2]\n\tlinked_item_data_3_0 -> linked_tail_data [arrowhead=normal color=\"#9ca3af\" penwidth=1.1]\n}\n"
        }
      ]
    }
  ],
  "hash-table": [
    {
      "variable": "data",
      "kind": "dot",
      "compatibleViewKinds": [
        "auto",
        "matrix"
      ],
      "steps": [
        {
          "stepId": "step 1",
          "timelineKey": "0:1",
          "eventOrder": 1,
          "executionId": 0,
          "order": 1,
          "index": 0,
          "meta": {
            "var_id": 1,
            "access_path": "data",
            "access_paths": [
              "data"
            ],
            "scope_id": 0,
            "line_number": 1,
            "execution_id": 0,
            "order": 1
          },
          "dot": "digraph G {\n\tgraph [fontcolor=\"#0f172a\" fontname=Helvetica fontsize=16 label=<<font point-size='16' color='#0f172a'><b>data [step 0]</b></font>> labeljust=c labelloc=t nodesep=0.01 rankdir=TB ranksep=0.055]\n\tnode [color=\"#1f2933\" fillcolor=\"#ffffff\" fontname=Helvetica shape=box style=\"rounded,filled\"]\n\tedge [color=\"#6b7280\" fontname=Helvetica]\n\tmatrix_cell_data_0_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td width='120' height='30' align='center' bgcolor='#ffffff' cellpadding='0'><font point-size=\"12\" color=\"#0f172a\">1</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-data-matrix-cell-0-0\" penwidth=1.0 shape=plain]\n\tmatrix_cell_data_0_1 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td width='120' height='30' align='center' bgcolor='#ffffff' cellpadding='0'><font point-size=\"12\" color=\"#0f172a\">2</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-data-matrix-cell-0-1\" penwidth=1.0 shape=plain]\n\tmatrix_cell_data_1_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td width='120' height='30' align='center' bgcolor='#ffffff' cellpadding='0'><font point-size=\"12\" color=\"#0f172a\">&#xa0;</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-data-matrix-cell-1-0\" penwidth=1.0 shape=plain]\n\tmatrix_cell_data_1_1 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td width='120' height='30' align='center' bgcolor='#ffffff' cellpadding='0'><font point-size=\"12\" color=\"#0f172a\">&#xa0;</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-data-matrix-cell-1-1\" penwidth=1.0 shape=plain]\n\tmatrix_cell_data_2_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td width='120' height='30' align='center' bgcolor='#ffffff' cellpadding='0'><table border='0' cellborder='0' cellspacing='0' cellpadding='0'><tr><td align='center' bgcolor='#eef2ff' cellpadding='0'><table border='0' cellborder='0' cellspacing='0' cellpadding='0'><tr><td align='center' bgcolor='#ffffff' cellpadding='0'><table border='1' cellborder='1' cellspacing='0'><tr><td width='92' bgcolor='#f3f4f6' align='center'><b>Key</b></td><td width='140' bgcolor='#f3f4f6' align='center'><b>Value</b></td></tr><tr><td width='92' align='center'>id</td><td width='140' align='center'><font point-size=\"12\" color=\"#0f172a\">1</font></td></tr><tr><td width='92' align='center'>value</td><td width='140' align='center'><font point-size=\"12\" color=\"#0f172a\">a</font></td></tr></table></td></tr></table></td></tr></table></td></tr></table>> color=\"#cbd5e1\" id=\"cv-data-matrix-cell-2-0\" penwidth=1.0 shape=plain]\n\tmatrix_cell_data_2_1 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td width='120' height='30' align='center' bgcolor='#ffffff' cellpadding='0'><table border='0' cellborder='0' cellspacing='0' cellpadding='0'><tr><td align='center' bgcolor='#eef2ff' cellpadding='0'><table border='0' cellborder='0' cellspacing='0' cellpadding='0'><tr><td align='center' bgcolor='#ffffff' cellpadding='0'><table border='1' cellborder='1' cellspacing='0'><tr><td width='92' bgcolor='#f3f4f6' align='center'><b>Key</b></td><td width='140' bgcolor='#f3f4f6' align='center'><b>Value</b></td></tr><tr><td width='92' align='center'>id</td><td width='140' align='center'><font point-size=\"12\" color=\"#0f172a\">2</font></td></tr><tr><td width='92' align='center'>value</td><td width='140' align='center'><font point-size=\"12\" color=\"#0f172a\">b</font></td></tr></table></td></tr></table></td></tr></table></td></tr></table>> color=\"#cbd5e1\" id=\"cv-data-matrix-cell-2-1\" penwidth=1.0 shape=plain]\n\tmatrix_col_data_0 [label=<<table border='0' cellborder='0' cellspacing='0' cellpadding='0'><tr><td width='120' height='30' align='center' bgcolor='#f3f4f6' cellpadding='0'><font color='#dc2626' point-size='11'>0</font></td></tr></table>> color=\"#e2e8f0\" penwidth=0.8 shape=plain]\n\tmatrix_col_data_1 [label=<<table border='0' cellborder='0' cellspacing='0' cellpadding='0'><tr><td width='120' height='30' align='center' bgcolor='#f3f4f6' cellpadding='0'><font color='#dc2626' point-size='11'>1</font></td></tr></table>> color=\"#e2e8f0\" penwidth=0.8 shape=plain]\n\tmatrix_corner_data [label=<<table border='0' cellborder='0' cellspacing='0' cellpadding='0'><tr><td width='54' height='30' align='center' cellpadding='0'></td></tr></table>> color=\"#ffffff\" penwidth=0.0 shape=plain]\n\tmatrix_exp_1 [label=\"\" height=0.01 shape=point style=invis width=0.01]\n\tmatrix_row_data_0 [label=<<table border='0' cellborder='0' cellspacing='0' cellpadding='0'><tr><td width='54' height='30' align='center' bgcolor='#fef3c7' cellpadding='0'><font color='#b45309' point-size='11'>0</font></td></tr></table>> color=\"#f8dca3\" penwidth=0.8 shape=plain]\n\tmatrix_row_data_1 [label=<<table border='0' cellborder='0' cellspacing='0' cellpadding='0'><tr><td width='54' height='30' align='center' bgcolor='#fef3c7' cellpadding='0'><font color='#b45309' point-size='11'>1</font></td></tr></table>> color=\"#f8dca3\" penwidth=0.8 shape=plain]\n\tmatrix_row_data_2 [label=<<table border='0' cellborder='0' cellspacing='0' cellpadding='0'><tr><td width='54' height='30' align='center' bgcolor='#fef3c7' cellpadding='0'><font color='#b45309' point-size='11'>2</font></td></tr></table>> color=\"#f8dca3\" penwidth=0.8 shape=plain]\n\tmatrix_corner_data -> matrix_col_data_0 [style=invis weight=14]\n\tmatrix_col_data_0 -> matrix_col_data_1 [style=invis weight=14]\n\tmatrix_row_data_0 -> matrix_cell_data_0_0 [style=invis weight=16]\n\tmatrix_cell_data_0_0 -> matrix_cell_data_0_1 [style=invis weight=16]\n\tmatrix_row_data_1 -> matrix_cell_data_1_0 [style=invis weight=16]\n\tmatrix_cell_data_1_0 -> matrix_cell_data_1_1 [style=invis weight=16]\n\tmatrix_row_data_0 -> matrix_row_data_1 [style=invis weight=16]\n\tmatrix_cell_data_0_0 -> matrix_cell_data_1_0 [style=invis weight=16]\n\tmatrix_cell_data_0_1 -> matrix_cell_data_1_1 [style=invis weight=16]\n\tmatrix_row_data_2 -> matrix_cell_data_2_0 [style=invis weight=16]\n\tmatrix_cell_data_2_0 -> matrix_cell_data_2_1 [style=invis weight=16]\n\tmatrix_row_data_1 -> matrix_row_data_2 [style=invis weight=16]\n\tmatrix_cell_data_1_0 -> matrix_cell_data_2_0 [style=invis weight=16]\n\tmatrix_cell_data_1_1 -> matrix_cell_data_2_1 [style=invis weight=16]\n\tmatrix_col_data_0 -> matrix_cell_data_0_0 [style=invis weight=16]\n\tmatrix_col_data_1 -> matrix_cell_data_0_1 [style=invis weight=16]\n\tmatrix_exp_1 -> matrix_corner_data [style=invis weight=16]\n\tmatrix_corner_data -> matrix_row_data_0 [style=invis weight=16]\n{rank=same; matrix_cell_data_0_0 matrix_cell_data_0_1 matrix_row_data_0 }{rank=same; matrix_cell_data_1_0 matrix_cell_data_1_1 matrix_row_data_1 }{rank=same; matrix_cell_data_2_0 matrix_cell_data_2_1 matrix_row_data_2 }{rank=same; matrix_col_data_0 matrix_col_data_1 matrix_corner_data }}\n"
        }
      ]
    }
  ],
  "bfs-queue": [
    {
      "variable": "queue",
      "kind": "dot",
      "compatibleViewKinds": [
        "auto"
      ],
      "steps": [
        {
          "stepId": "step 8",
          "timelineKey": "15:8",
          "eventOrder": 13,
          "executionId": 15,
          "order": 8,
          "index": 15,
          "meta": {
            "var_id": 13,
            "access_path": "queue",
            "access_paths": [
              "queue"
            ],
            "scope_id": 0,
            "line_number": 9,
            "execution_id": 15,
            "order": 8
          },
          "dot": "digraph G {\n\tgraph [fontcolor=\"#0f172a\" fontname=Helvetica fontsize=16 label=<<font point-size='16' color='#0f172a'><b>queue</b></font>> labeljust=c labelloc=t nodesep=0.006 rankdir=TB ranksep=0.06]\n\tnode [color=\"#1f2933\" fillcolor=\"#ffffff\" fontname=Helvetica shape=box style=\"rounded,filled\"]\n\tedge [color=\"#6b7280\" fontname=Helvetica]\n\tarr_exp_1 [label=\"\" height=0.01 shape=point style=invis width=0.01]\n\tarr_item_queue_C_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_queue_C_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">C</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>0</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-queue-array-item-C-0\" penwidth=1.1 shape=plain]\n\tarr_item_queue_D_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_queue_D_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">D</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>1</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-queue-array-item-D-0\" penwidth=1.1 shape=plain]\n\tarr_exp_1 -> arr_item_queue_C_0 [style=invis]\n\tarr_item_queue_C_0 -> arr_item_queue_D_0 [style=invis]\n{rank=same; arr_item_queue_C_0 arr_item_queue_D_0 }}\n"
        }
      ]
    },
    {
      "variable": "visited",
      "kind": "dot",
      "compatibleViewKinds": [
        "auto",
        "array_cells"
      ],
      "steps": [
        {
          "stepId": "step 10",
          "timelineKey": "17:10",
          "eventOrder": 15,
          "executionId": 17,
          "order": 10,
          "index": 17,
          "meta": {
            "var_id": 15,
            "access_path": "visited",
            "access_paths": [
              "visited"
            ],
            "scope_id": 0,
            "line_number": 7,
            "execution_id": 17,
            "order": 10
          },
          "dot": "digraph G {\n\tgraph [fontcolor=\"#0f172a\" fontname=Helvetica fontsize=16 label=<<font point-size='16' color='#0f172a'><b>visited</b></font>> labeljust=c labelloc=t nodesep=0.006 rankdir=TB ranksep=0.06]\n\tnode [color=\"#1f2933\" fillcolor=\"#ffffff\" fontname=Helvetica shape=box style=\"rounded,filled\"]\n\tedge [color=\"#6b7280\" fontname=Helvetica]\n\tarr_exp_1 [label=\"\" height=0.01 shape=point style=invis width=0.01]\n\tarr_item_visited_A_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_visited_A_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">A</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>0</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-visited-array-item-A-0\" penwidth=1.1 shape=plain]\n\tarr_item_visited_B_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_visited_B_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">B</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>1</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-visited-array-item-B-0\" penwidth=1.1 shape=plain]\n\tarr_item_visited_C_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_visited_C_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">C</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>2</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-visited-array-item-C-0\" penwidth=1.1 shape=plain]\n\tarr_exp_1 -> arr_item_visited_A_0 [style=invis]\n\tarr_item_visited_A_0 -> arr_item_visited_B_0 [style=invis]\n\tarr_item_visited_B_0 -> arr_item_visited_C_0 [style=invis]\n{rank=same; arr_item_visited_A_0 arr_item_visited_B_0 arr_item_visited_C_0 }}\n"
        }
      ]
    },
    {
      "variable": "node",
      "kind": "dot",
      "compatibleViewKinds": [
        "auto"
      ],
      "steps": [
        {
          "stepId": "step 9",
          "timelineKey": "17:9",
          "eventOrder": 14,
          "executionId": 17,
          "order": 9,
          "index": 17,
          "meta": {
            "var_id": 14,
            "access_path": "node",
            "access_paths": [
              "node"
            ],
            "scope_id": 0,
            "line_number": 6,
            "execution_id": 17,
            "order": 9
          },
          "dot": "digraph G {\n\tgraph [nodesep=0.6 rankdir=LR ranksep=0.7]\n\tnode [color=\"#1f2933\" fillcolor=\"#ffffff\" fontname=Helvetica shape=box style=\"rounded,filled\"]\n\tedge [color=\"#6b7280\" fontname=Helvetica]\n\tscalar_value [label=<<font point-size=\"12\" color=\"#0f172a\">C</font>> shape=plain]\n}\n"
        }
      ]
    }
  ],
  "nested-dict-list": [
    {
      "variable": "data",
      "kind": "dot",
      "compatibleViewKinds": [
        "auto",
        "table"
      ],
      "steps": [
        {
          "stepId": "step 2",
          "timelineKey": "0:2",
          "eventOrder": 2,
          "executionId": 0,
          "order": 2,
          "index": 0,
          "meta": {
            "var_id": 2,
            "access_path": "data['users'][1]['tags'][0]",
            "access_paths": [
              "data['users'][1]['tags'][0]"
            ],
            "scope_id": 0,
            "line_number": 8,
            "execution_id": 0,
            "order": 2
          },
          "dot": "digraph G {\n\tgraph [fontcolor=\"#0f172a\" fontname=Helvetica fontsize=16 label=<<font point-size='16' color='#0f172a'><b>data [step 0]</b></font>> labeljust=c labelloc=t nodesep=0.01 rankdir=TB ranksep=0.035]\n\tnode [color=\"#1f2933\" fillcolor=\"#ffffff\" fontname=Helvetica shape=box style=\"rounded,filled\"]\n\tedge [color=\"#6b7280\" fontname=Helvetica]\n\ttable_exp_1 [label=\"\" height=0.01 shape=point style=invis width=0.01]\n\ttable_header_data [label=<<table BORDER='1' CELLBORDER='1' CELLSPACING='0' CELLPADDING='0'><tr><td width='874' FIXEDSIZE='TRUE' CELLPADDING='0'><table BORDER='0' CELLBORDER='1' CELLSPACING='0' CELLPADDING='0'><tr><td WIDTH='92' FIXEDSIZE='TRUE' ALIGN='CENTER' BGCOLOR='#e5e7eb' CELLPADDING='6'><font color='#0f172a'><b>Key</b></font></td><td WIDTH='782' FIXEDSIZE='TRUE' ALIGN='CENTER' BGCOLOR='#e5e7eb' CELLPADDING='6'><font color='#0f172a'><b>Value</b></font></td></tr></table></td></tr></table>> color=\"#cbd5e1\" penwidth=1.0 shape=plain width=12.14]\n\ttable_row_data_meta [label=<<table BORDER='1' CELLBORDER='1' CELLSPACING='0' CELLPADDING='0'><tr><td width='874' FIXEDSIZE='TRUE' CELLPADDING='0'><table BORDER='0' CELLBORDER='1' CELLSPACING='0' CELLPADDING='0'><tr><td WIDTH='92' FIXEDSIZE='TRUE' ALIGN='CENTER' BGCOLOR='#f8fafc' CELLPADDING='6'><font color='#0f172a' point-size='11'><b>meta</b></font></td><td WIDTH='782' FIXEDSIZE='TRUE' ALIGN='CENTER' BGCOLOR='#ffffff' CELLPADDING='6' PORT='table_row_data_meta_value'><table border='0' cellborder='0' cellspacing='0' cellpadding='0'><tr><td width='782' align='center'><table border='1' cellborder='1' cellspacing='0'><tr><td width='92' bgcolor='#f3f4f6' align='center'><b>Key</b></td><td width='140' bgcolor='#f3f4f6' align='center'><b>Value</b></td></tr><tr><td width='92' align='center'>page</td><td width='140' align='center'><font point-size=\"12\" color=\"#0f172a\">1</font></td></tr><tr><td width='92' align='center'>total</td><td width='140' align='center'><font point-size=\"12\" color=\"#0f172a\">2</font></td></tr></table></td></tr></table></td></tr></table></td></tr></table>> color=\"#cbd5e1\" id=\"cv-data-table-row-meta\" penwidth=1.0 shape=plain width=12.14]\n\ttable_row_data_users [label=<<table BORDER='1' CELLBORDER='1' CELLSPACING='0' CELLPADDING='0'><tr><td width='874' FIXEDSIZE='TRUE' CELLPADDING='0'><table BORDER='0' CELLBORDER='1' CELLSPACING='0' CELLPADDING='0'><tr><td WIDTH='92' FIXEDSIZE='TRUE' ALIGN='CENTER' BGCOLOR='#dbeafe' CELLPADDING='6'><font color='#0f172a' point-size='11'><b>users</b></font></td><td WIDTH='782' FIXEDSIZE='TRUE' ALIGN='CENTER' BGCOLOR='#eff6ff' CELLPADDING='6' PORT='table_row_data_users_value'><table border='0' cellborder='0' cellspacing='0' cellpadding='0'><tr><td width='782' align='center'><table id='cv-data--step-0--users-wrapper' border='0' cellborder='0' cellspacing='0'><tr><td id='cv-data--step-0--users-value-table-container'><table id='cv-data--step-0--users-value-table' border='1' cellborder='1' cellspacing='0'><tr id='cv-data--step-0--users-value-row'><td align='center' bgcolor='#ffffff' cellpadding='4'><table border='1' cellborder='1' cellspacing='0'><tr><td width='92' bgcolor='#f3f4f6' align='center'><b>Key</b></td><td width='198' bgcolor='#f3f4f6' align='center'><b>Value</b></td></tr><tr><td width='92' align='center'>id</td><td width='198' align='center'><font point-size=\"12\" color=\"#0f172a\">1</font></td></tr><tr><td width='92' align='center'>tags</td><td width='198' align='center'><font point-size=\"12\" color=\"#475569\">list len=2</font></td></tr></table></td><td align='center' bgcolor='#ffffff' cellpadding='4'><table border='1' cellborder='1' cellspacing='0'><tr><td width='92' bgcolor='#f3f4f6' align='center'><b>Key</b></td><td width='198' bgcolor='#f3f4f6' align='center'><b>Value</b></td></tr><tr><td width='92' align='center'>id</td><td width='198' align='center'><font point-size=\"12\" color=\"#0f172a\">2</font></td></tr><tr><td width='92' align='center'>tags</td><td width='198' align='center'><font point-size=\"12\" color=\"#475569\">list len=2</font></td></tr></table></td></tr></table></td></tr><tr><td id='cv-data--step-0--users-index-table-container'><table id='cv-data--step-0--users-index-table' border='0' cellborder='0' cellspacing='4'><tr id='cv-data--step-0--users-index-row'><td align='center'><font color='#dc2626' point-size='12'>0</font></td><td align='center'><font color='#dc2626' point-size='12'>1</font></td></tr></table></td></tr></table></td></tr></table></td></tr></table></td></tr></table>> color=\"#60a5fa\" id=\"cv-data-table-row-users\" penwidth=1.8 shape=plain width=12.14]\n\ttable_header_data -> table_row_data_users [style=invis]\n\ttable_row_data_users -> table_row_data_meta [style=invis]\n\ttable_exp_1 -> table_header_data [style=invis]\n}\n"
        }
      ]
    }
  ],
  "tree": [
    {
      "variable": "data",
      "kind": "dot",
      "compatibleViewKinds": [
        "auto",
        "tree"
      ],
      "steps": [
        {
          "stepId": "step 1",
          "timelineKey": "0:1",
          "eventOrder": 1,
          "executionId": 0,
          "order": 1,
          "index": 0,
          "meta": {
            "var_id": 1,
            "access_path": "data",
            "access_paths": [
              "data"
            ],
            "scope_id": 0,
            "line_number": 1,
            "execution_id": 0,
            "order": 1
          },
          "dot": "digraph G {\n\tgraph [fontcolor=\"#0f172a\" fontname=Helvetica fontsize=16 label=<<font point-size='16' color='#0f172a'><b>data [step 0]</b></font>> labeljust=c labelloc=t nodesep=0.01 rankdir=TB ranksep=0.06]\n\tnode [color=\"#1f2933\" fillcolor=\"#ffffff\" fontname=Helvetica shape=box style=\"rounded,filled\"]\n\tedge [color=\"#6b7280\" fontname=Helvetica]\n\ttree_1__t_940ae8b14385e3bb_1 [label=<<font point-size=\"12\" color=\"#0f172a\">B</font>> shape=plain]\n\ttree_1__t_99450d4853a50dda_1 [label=<<font point-size=\"12\" color=\"#0f172a\">A</font>> shape=plain]\n\ttree_1__t_d85a671bc54426d5_1 [label=<<font point-size=\"12\" color=\"#0f172a\">C</font>> shape=plain]\n\ttree_1__t_e3395f6b3e0e107c_1 [label=<<font point-size=\"12\" color=\"#0f172a\">D</font>> shape=plain]\n\ttree_1__t_99450d4853a50dda_1 -> tree_1__t_940ae8b14385e3bb_1\n\ttree_1__t_99450d4853a50dda_1 -> tree_1__t_d85a671bc54426d5_1\n\ttree_1__t_d85a671bc54426d5_1 -> tree_1__t_e3395f6b3e0e107c_1\n}\n"
        }
      ]
    }
  ],
  "fenwick-tree-trace": [
    {
      "variable": "values",
      "kind": "dot",
      "compatibleViewKinds": [
        "auto",
        "array_cells",
        "bar",
        "heap_dual"
      ],
      "steps": [
        {
          "stepId": "step 1",
          "timelineKey": "0:1",
          "eventOrder": 1,
          "executionId": 0,
          "order": 1,
          "index": 0,
          "meta": {
            "var_id": 1,
            "access_path": "values",
            "access_paths": [
              "values"
            ],
            "scope_id": 0,
            "line_number": 1,
            "execution_id": 0,
            "order": 1
          },
          "dot": "digraph G {\n\tgraph [fontcolor=\"#0f172a\" fontname=Helvetica fontsize=16 label=<<font point-size='16' color='#0f172a'><b>values</b></font>> labeljust=c labelloc=t nodesep=0.006 rankdir=TB ranksep=0.06]\n\tnode [color=\"#1f2933\" fillcolor=\"#ffffff\" fontname=Helvetica shape=box style=\"rounded,filled\"]\n\tedge [color=\"#6b7280\" fontname=Helvetica]\n\tarr_exp_1 [label=\"\" height=0.01 shape=point style=invis width=0.01]\n\tarr_item_values_1_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_values_1_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">-1</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>2</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-values-array-item--1-0\" penwidth=1.1 shape=plain]\n\tarr_item_values_2_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_values_2_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">2</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>1</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-values-array-item-2-0\" penwidth=1.1 shape=plain]\n\tarr_item_values_3_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_values_3_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">-3</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>6</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-values-array-item--3-0\" penwidth=1.1 shape=plain]\n\tarr_item_values_3_1 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_values_3_1_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">3</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>7</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-values-array-item-3-1\" penwidth=1.1 shape=plain]\n\tarr_item_values_4_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_values_4_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">4</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>5</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-values-array-item-4-0\" penwidth=1.1 shape=plain]\n\tarr_item_values_5_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_values_5_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">5</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>4</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-values-array-item-5-0\" penwidth=1.1 shape=plain]\n\tarr_item_values_6_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_values_6_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">6</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>3</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-values-array-item-6-0\" penwidth=1.1 shape=plain]\n\tarr_exp_1 -> arr_item_values_3_0 [style=invis]\n\tarr_item_values_3_0 -> arr_item_values_2_0 [style=invis]\n\tarr_item_values_2_0 -> arr_item_values_1_0 [style=invis]\n\tarr_item_values_1_0 -> arr_item_values_6_0 [style=invis]\n\tarr_item_values_6_0 -> arr_item_values_5_0 [style=invis]\n\tarr_item_values_5_0 -> arr_item_values_4_0 [style=invis]\n\tarr_item_values_4_0 -> arr_item_values_3_0 [style=invis]\n\tarr_item_values_3_0 -> arr_item_values_3_1 [style=invis]\n{rank=same; arr_item_values_1_0 arr_item_values_2_0 arr_item_values_3_0 arr_item_values_3_1 arr_item_values_4_0 arr_item_values_5_0 arr_item_values_6_0 }}\n"
        }
      ]
    },
    {
      "variable": "tree",
      "kind": "dot",
      "compatibleViewKinds": [
        "auto",
        "array_cells",
        "bar",
        "heap_dual"
      ],
      "steps": [
        {
          "stepId": "step 4",
          "timelineKey": "21:4",
          "eventOrder": 34,
          "executionId": 21,
          "order": 4,
          "index": 21,
          "meta": {
            "var_id": 34,
            "access_path": "tree[index]",
            "access_paths": [
              "tree[index]"
            ],
            "scope_id": 4,
            "line_number": 8,
            "execution_id": 21,
            "order": 4
          },
          "dot": "digraph G {\n\tgraph [fontcolor=\"#0f172a\" fontname=Helvetica fontsize=16 label=<<font point-size='16' color='#0f172a'><b>tree</b></font>> labeljust=c labelloc=t nodesep=0.006 rankdir=TB ranksep=0.06]\n\tnode [color=\"#1f2933\" fillcolor=\"#ffffff\" fontname=Helvetica shape=box style=\"rounded,filled\"]\n\tedge [color=\"#6b7280\" fontname=Helvetica]\n\tarr_exp_1 [label=\"\" height=0.01 shape=point style=invis width=0.01]\n\tarr_item_tree_0_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_0_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">0</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>0</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-0-0\" penwidth=1.1 shape=plain]\n\tarr_item_tree_0_1 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_0_1_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">0</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>5</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-0-1\" penwidth=1.1 shape=plain]\n\tarr_item_tree_0_2 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_0_2_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">0</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>6</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-0-2\" penwidth=1.1 shape=plain]\n\tarr_item_tree_0_3 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_0_3_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">0</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>7</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-0-3\" penwidth=1.1 shape=plain]\n\tarr_item_tree_1_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_1_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">-1</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>3</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item--1-0\" penwidth=1.1 shape=plain]\n\tarr_item_tree_3_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_3_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">3</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>1</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-3-0\" penwidth=1.1 shape=plain]\n\tarr_item_tree_4_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_4_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">4</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>4</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-4-0\" penwidth=1.1 shape=plain]\n\tarr_item_tree_4_1 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_4_1_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">4</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>8</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-4-1\" penwidth=1.1 shape=plain]\n\tarr_item_tree_5_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_5_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">5</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>2</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-5-0\" penwidth=1.1 shape=plain]\n\tarr_exp_1 -> arr_item_tree_0_0 [style=invis]\n\tarr_item_tree_0_0 -> arr_item_tree_3_0 [style=invis]\n\tarr_item_tree_3_0 -> arr_item_tree_5_0 [style=invis]\n\tarr_item_tree_5_0 -> arr_item_tree_1_0 [style=invis]\n\tarr_item_tree_1_0 -> arr_item_tree_4_0 [style=invis]\n\tarr_item_tree_4_0 -> arr_item_tree_0_1 [style=invis]\n\tarr_item_tree_0_1 -> arr_item_tree_0_2 [style=invis]\n\tarr_item_tree_0_2 -> arr_item_tree_0_3 [style=invis]\n\tarr_item_tree_0_3 -> arr_item_tree_4_1 [style=invis]\n{rank=same; arr_item_tree_0_0 arr_item_tree_0_1 arr_item_tree_0_2 arr_item_tree_0_3 arr_item_tree_1_0 arr_item_tree_3_0 arr_item_tree_4_0 arr_item_tree_4_1 arr_item_tree_5_0 }}\n"
        }
      ]
    },
    {
      "variable": "prefix_sums",
      "kind": "dot",
      "compatibleViewKinds": [
        "auto",
        "matrix"
      ],
      "steps": [
        {
          "stepId": "step 3",
          "timelineKey": "0:3",
          "eventOrder": 3,
          "executionId": 0,
          "order": 3,
          "index": 0,
          "meta": {
            "var_id": 3,
            "access_path": "prefix_sums",
            "access_paths": [
              "prefix_sums"
            ],
            "scope_id": 0,
            "line_number": 3,
            "execution_id": 0,
            "order": 3
          },
          "dot": "digraph G {\n\tgraph [fontcolor=\"#0f172a\" fontname=Helvetica fontsize=16 label=<<font point-size='16' color='#0f172a'><b>prefix_sums [step 0]</b></font>> labeljust=c labelloc=t nodesep=0.01 rankdir=TB ranksep=0.055]\n\tnode [color=\"#1f2933\" fillcolor=\"#ffffff\" fontname=Helvetica shape=box style=\"rounded,filled\"]\n\tedge [color=\"#6b7280\" fontname=Helvetica]\n\tmatrix_corner_prefix_sums [label=<<table border='0' cellborder='0' cellspacing='0' cellpadding='0'><tr><td width='54' height='30' align='center' cellpadding='0'></td></tr></table>> color=\"#ffffff\" penwidth=0.0 shape=plain]\n\tmatrix_exp_1 [label=\"\" height=0.01 shape=point style=invis width=0.01]\n}\n"
        }
      ]
    }
  ],
  "segment-tree-trace": [
    {
      "variable": "values",
      "kind": "dot",
      "compatibleViewKinds": [
        "auto",
        "array_cells",
        "bar",
        "heap_dual"
      ],
      "steps": [
        {
          "stepId": "step 3",
          "timelineKey": "0:3",
          "eventOrder": 63,
          "executionId": 0,
          "order": 3,
          "index": 0,
          "meta": {
            "var_id": 63,
            "access_path": "values[2]",
            "access_paths": [
              "values[2]"
            ],
            "scope_id": 0,
            "line_number": 29,
            "execution_id": 0,
            "order": 3
          },
          "dot": "digraph G {\n\tgraph [fontcolor=\"#0f172a\" fontname=Helvetica fontsize=16 label=<<font point-size='16' color='#0f172a'><b>values</b></font>> labeljust=c labelloc=t nodesep=0.006 rankdir=TB ranksep=0.06]\n\tnode [color=\"#1f2933\" fillcolor=\"#ffffff\" fontname=Helvetica shape=box style=\"rounded,filled\"]\n\tedge [color=\"#6b7280\" fontname=Helvetica]\n\tarr_exp_1 [label=\"\" height=0.01 shape=point style=invis width=0.01]\n\tarr_item_values_1_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_values_1_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">1</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>1</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-values-array-item-1-0\" penwidth=1.1 shape=plain]\n\tarr_item_values_2_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_values_2_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">2</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>0</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-values-array-item-2-0\" penwidth=1.1 shape=plain]\n\tarr_item_values_3_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_values_3_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">3</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>3</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-values-array-item-3-0\" penwidth=1.1 shape=plain]\n\tarr_item_values_4_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_values_4_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">4</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>4</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-values-array-item-4-0\" penwidth=1.1 shape=plain]\n\tarr_item_values_6_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_values_6_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#eff6ff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">6</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>2</font></td></tr></table>> color=\"#60a5fa\" id=\"cv-values-array-item-6-0\" penwidth=1.6 shape=plain]\n\tarr_exp_1 -> arr_item_values_2_0 [style=invis]\n\tarr_item_values_2_0 -> arr_item_values_1_0 [style=invis]\n\tarr_item_values_1_0 -> arr_item_values_6_0 [style=invis]\n\tarr_item_values_6_0 -> arr_item_values_3_0 [style=invis]\n\tarr_item_values_3_0 -> arr_item_values_4_0 [style=invis]\n{rank=same; arr_item_values_1_0 arr_item_values_2_0 arr_item_values_3_0 arr_item_values_4_0 arr_item_values_6_0 }}\n"
        }
      ]
    },
    {
      "variable": "tree",
      "kind": "dot",
      "compatibleViewKinds": [
        "auto",
        "array_cells",
        "bar",
        "heap_dual"
      ],
      "steps": [
        {
          "stepId": "step 8",
          "timelineKey": "18:8",
          "eventOrder": 36,
          "executionId": 18,
          "order": 8,
          "index": 18,
          "meta": {
            "var_id": 36,
            "access_path": "tree[node]",
            "access_paths": [
              "tree[node]"
            ],
            "scope_id": 10,
            "line_number": 7,
            "execution_id": 18,
            "order": 8
          },
          "dot": "digraph G {\n\tgraph [fontcolor=\"#0f172a\" fontname=Helvetica fontsize=16 label=<<font point-size='16' color='#0f172a'><b>tree</b></font>> labeljust=c labelloc=t nodesep=0.006 rankdir=TB ranksep=0.06]\n\tnode [color=\"#1f2933\" fillcolor=\"#ffffff\" fontname=Helvetica shape=box style=\"rounded,filled\"]\n\tedge [color=\"#6b7280\" fontname=Helvetica]\n\tarr_exp_1 [label=\"\" height=0.01 shape=point style=invis width=0.01]\n\tarr_item_tree_0_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_0_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">0</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>0</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-0-0\" penwidth=1.1 shape=plain]\n\tarr_item_tree_0_1 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_0_1_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">0</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>1</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-0-1\" penwidth=1.1 shape=plain]\n\tarr_item_tree_0_10 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_0_10_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">0</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>16</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-0-10\" penwidth=1.1 shape=plain]\n\tarr_item_tree_0_11 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_0_11_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">0</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>17</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-0-11\" penwidth=1.1 shape=plain]\n\tarr_item_tree_0_12 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_0_12_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">0</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>18</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-0-12\" penwidth=1.1 shape=plain]\n\tarr_item_tree_0_13 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_0_13_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">0</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>19</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-0-13\" penwidth=1.1 shape=plain]\n\tarr_item_tree_0_2 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_0_2_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">0</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>3</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-0-2\" penwidth=1.1 shape=plain]\n\tarr_item_tree_0_3 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_0_3_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">0</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>7</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-0-3\" penwidth=1.1 shape=plain]\n\tarr_item_tree_0_4 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_0_4_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">0</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>10</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-0-4\" penwidth=1.1 shape=plain]\n\tarr_item_tree_0_5 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_0_5_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">0</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>11</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-0-5\" penwidth=1.1 shape=plain]\n\tarr_item_tree_0_6 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_0_6_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">0</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>12</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-0-6\" penwidth=1.1 shape=plain]\n\tarr_item_tree_0_7 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_0_7_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">0</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>13</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-0-7\" penwidth=1.1 shape=plain]\n\tarr_item_tree_0_8 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_0_8_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">0</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>14</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-0-8\" penwidth=1.1 shape=plain]\n\tarr_item_tree_0_9 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_0_9_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">0</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>15</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-0-9\" penwidth=1.1 shape=plain]\n\tarr_item_tree_1_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_1_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">1</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>9</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-1-0\" penwidth=1.1 shape=plain]\n\tarr_item_tree_2_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_2_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">2</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>4</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-2-0\" penwidth=1.1 shape=plain]\n\tarr_item_tree_2_1 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_2_1_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">2</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>8</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-2-1\" penwidth=1.1 shape=plain]\n\tarr_item_tree_3_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_3_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">3</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>6</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-3-0\" penwidth=1.1 shape=plain]\n\tarr_item_tree_5_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_5_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">5</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>2</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-5-0\" penwidth=1.1 shape=plain]\n\tarr_item_tree_5_1 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_tree_5_1_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">5</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>5</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-tree-array-item-5-1\" penwidth=1.1 shape=plain]\n\tarr_exp_1 -> arr_item_tree_0_0 [style=invis]\n\tarr_item_tree_0_0 -> arr_item_tree_0_1 [style=invis]\n\tarr_item_tree_0_1 -> arr_item_tree_5_0 [style=invis]\n\tarr_item_tree_5_0 -> arr_item_tree_0_2 [style=invis]\n\tarr_item_tree_0_2 -> arr_item_tree_2_0 [style=invis]\n\tarr_item_tree_2_0 -> arr_item_tree_5_1 [style=invis]\n\tarr_item_tree_5_1 -> arr_item_tree_3_0 [style=invis]\n\tarr_item_tree_3_0 -> arr_item_tree_0_3 [style=invis]\n\tarr_item_tree_0_3 -> arr_item_tree_2_1 [style=invis]\n\tarr_item_tree_2_1 -> arr_item_tree_1_0 [style=invis]\n\tarr_item_tree_1_0 -> arr_item_tree_0_4 [style=invis]\n\tarr_item_tree_0_4 -> arr_item_tree_0_5 [style=invis]\n\tarr_item_tree_0_5 -> arr_item_tree_0_6 [style=invis]\n\tarr_item_tree_0_6 -> arr_item_tree_0_7 [style=invis]\n\tarr_item_tree_0_7 -> arr_item_tree_0_8 [style=invis]\n\tarr_item_tree_0_8 -> arr_item_tree_0_9 [style=invis]\n\tarr_item_tree_0_9 -> arr_item_tree_0_10 [style=invis]\n\tarr_item_tree_0_10 -> arr_item_tree_0_11 [style=invis]\n\tarr_item_tree_0_11 -> arr_item_tree_0_12 [style=invis]\n\tarr_item_tree_0_12 -> arr_item_tree_0_13 [style=invis]\n{rank=same; arr_item_tree_0_0 arr_item_tree_0_1 arr_item_tree_0_10 arr_item_tree_0_11 arr_item_tree_0_12 arr_item_tree_0_13 arr_item_tree_0_2 arr_item_tree_0_3 arr_item_tree_0_4 arr_item_tree_0_5 arr_item_tree_0_6 arr_item_tree_0_7 arr_item_tree_0_8 arr_item_tree_0_9 arr_item_tree_1_0 arr_item_tree_2_0 arr_item_tree_2_1 arr_item_tree_3_0 arr_item_tree_5_0 arr_item_tree_5_1 }}\n"
        }
      ]
    }
  ],
  "graph": [
    {
      "variable": "data",
      "kind": "dot",
      "compatibleViewKinds": [
        "auto",
        "graph"
      ],
      "steps": [
        {
          "stepId": "step 1",
          "timelineKey": "0:1",
          "eventOrder": 1,
          "executionId": 0,
          "order": 1,
          "index": 0,
          "meta": {
            "var_id": 1,
            "access_path": "data",
            "access_paths": [
              "data"
            ],
            "scope_id": 0,
            "line_number": 1,
            "execution_id": 0,
            "order": 1
          },
          "dot": "digraph G {\n\tgraph [fontcolor=\"#0f172a\" fontname=Helvetica fontsize=16 label=<<font point-size='16' color='#0f172a'><b>data [step 0]</b></font>> labeljust=c labelloc=t nodesep=0.01 rankdir=TB ranksep=0.06]\n\tnode [color=\"#1f2933\" fillcolor=\"#ffffff\" fontname=Helvetica shape=box style=\"rounded,filled\"]\n\tedge [color=\"#6b7280\" fontname=Helvetica]\n\tgraph_2__graph_node_data_step_0_A [label=<<table border='1' cellborder='1' cellspacing='0'><tr><td width='92' bgcolor='#f3f4f6' align='center'><b>Key</b></td><td width='140' bgcolor='#f3f4f6' align='center'><b>Value</b></td></tr><tr><td width='92' align='center'>id</td><td width='140' align='center'><font point-size=\"12\" color=\"#0f172a\">A</font></td></tr></table>> shape=plain]\n\tgraph_2__graph_node_data_step_0_B [label=<<table border='1' cellborder='1' cellspacing='0'><tr><td width='92' bgcolor='#f3f4f6' align='center'><b>Key</b></td><td width='140' bgcolor='#f3f4f6' align='center'><b>Value</b></td></tr><tr><td width='92' align='center'>id</td><td width='140' align='center'><font point-size=\"12\" color=\"#0f172a\">B</font></td></tr></table>> shape=plain]\n\tgraph_2__graph_node_data_step_0_C [label=<<table border='1' cellborder='1' cellspacing='0'><tr><td width='92' bgcolor='#f3f4f6' align='center'><b>Key</b></td><td width='140' bgcolor='#f3f4f6' align='center'><b>Value</b></td></tr><tr><td width='92' align='center'>id</td><td width='140' align='center'><font point-size=\"12\" color=\"#0f172a\">C</font></td></tr></table>> shape=plain]\n\tgraph_2__graph_root_1 [label=\"\" height=0.01 shape=point style=invis width=0.01]\n\tgraph_2__graph_node_data_step_0_A -> graph_2__graph_node_data_step_0_B [label=ab]\n\tgraph_2__graph_node_data_step_0_B -> graph_2__graph_node_data_step_0_C [label=bc]\n\tgraph_2__graph_root_1 -> graph_2__graph_node_data_step_0_A [style=invis]\n\tgraph_2__graph_root_1 -> graph_2__graph_node_data_step_0_B [style=invis]\n\tgraph_2__graph_root_1 -> graph_2__graph_node_data_step_0_C [style=invis]\n}\n"
        }
      ]
    }
  ],
  "suffix-array-basics": [
    {
      "variable": "suffixes",
      "kind": "dot",
      "compatibleViewKinds": [
        "auto",
        "array_cells"
      ],
      "steps": [
        {
          "stepId": "step 6",
          "timelineKey": "7:6",
          "eventOrder": 10,
          "executionId": 7,
          "order": 6,
          "index": 7,
          "meta": {
            "var_id": 10,
            "access_path": "suffixes",
            "access_paths": [
              "suffixes"
            ],
            "scope_id": 0,
            "line_number": 7,
            "execution_id": 7,
            "order": 6
          },
          "dot": "digraph G {\n\tgraph [fontcolor=\"#0f172a\" fontname=Helvetica fontsize=16 label=<<font point-size='16' color='#0f172a'><b>suffixes</b></font>> labeljust=c labelloc=t nodesep=0.006 rankdir=TB ranksep=0.06]\n\tnode [color=\"#1f2933\" fillcolor=\"#ffffff\" fontname=Helvetica shape=box style=\"rounded,filled\"]\n\tedge [color=\"#6b7280\" fontname=Helvetica]\n\tarr_exp_1 [label=\"\" height=0.01 shape=point style=invis width=0.01]\n\tarr_item_suffixes_0_banana_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_suffixes_0_banana_0_value' width='96' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">0:banana</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>0</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-suffixes-array-item-0-banana-0\" penwidth=1.1 shape=plain]\n\tarr_item_suffixes_1_anana_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_suffixes_1_anana_0_value' width='96' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">1:anana</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>1</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-suffixes-array-item-1-anana-0\" penwidth=1.1 shape=plain]\n\tarr_item_suffixes_2_nana_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_suffixes_2_nana_0_value' width='96' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">2:nana</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>2</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-suffixes-array-item-2-nana-0\" penwidth=1.1 shape=plain]\n\tarr_exp_1 -> arr_item_suffixes_0_banana_0 [style=invis]\n\tarr_item_suffixes_0_banana_0 -> arr_item_suffixes_1_anana_0 [style=invis]\n\tarr_item_suffixes_1_anana_0 -> arr_item_suffixes_2_nana_0 [style=invis]\n{rank=same; arr_item_suffixes_0_banana_0 arr_item_suffixes_1_anana_0 arr_item_suffixes_2_nana_0 }}\n"
        }
      ]
    },
    {
      "variable": "sorted_suffixes",
      "kind": "dot",
      "compatibleViewKinds": [
        "auto",
        "array_cells"
      ],
      "steps": [
        {
          "stepId": "step 4",
          "timelineKey": "0:4",
          "eventOrder": 19,
          "executionId": 0,
          "order": 4,
          "index": 0,
          "meta": {
            "var_id": 19,
            "access_path": "sorted_suffixes",
            "access_paths": [
              "sorted_suffixes"
            ],
            "scope_id": 0,
            "line_number": 11,
            "execution_id": 0,
            "order": 4
          },
          "dot": "digraph G {\n\tgraph [fontcolor=\"#0f172a\" fontname=Helvetica fontsize=16 label=<<font point-size='16' color='#0f172a'><b>sorted_suffixes</b></font>> labeljust=c labelloc=t nodesep=0.006 rankdir=TB ranksep=0.06]\n\tnode [color=\"#1f2933\" fillcolor=\"#ffffff\" fontname=Helvetica shape=box style=\"rounded,filled\"]\n\tedge [color=\"#6b7280\" fontname=Helvetica]\n\tarr_exp_1 [label=\"\" height=0.01 shape=point style=invis width=0.01]\n\tarr_item_sorted_suffixes_0_banana_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_sorted_suffixes_0_banana_0_value' width='96' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">0:banana</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>3</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-sorted_suffixes-array-item-0-banana-0\" penwidth=1.1 shape=plain]\n\tarr_item_sorted_suffixes_1_anana_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_sorted_suffixes_1_anana_0_value' width='96' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">1:anana</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>2</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-sorted_suffixes-array-item-1-anana-0\" penwidth=1.1 shape=plain]\n\tarr_item_sorted_suffixes_2_nana_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_sorted_suffixes_2_nana_0_value' width='96' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">2:nana</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>5</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-sorted_suffixes-array-item-2-nana-0\" penwidth=1.1 shape=plain]\n\tarr_item_sorted_suffixes_3_ana_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_sorted_suffixes_3_ana_0_value' width='96' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">3:ana</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>1</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-sorted_suffixes-array-item-3-ana-0\" penwidth=1.1 shape=plain]\n\tarr_item_sorted_suffixes_4_na_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_sorted_suffixes_4_na_0_value' width='96' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">4:na</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>4</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-sorted_suffixes-array-item-4-na-0\" penwidth=1.1 shape=plain]\n\tarr_item_sorted_suffixes_5_a_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_sorted_suffixes_5_a_0_value' width='96' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">5:a</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>0</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-sorted_suffixes-array-item-5-a-0\" penwidth=1.1 shape=plain]\n\tarr_exp_1 -> arr_item_sorted_suffixes_5_a_0 [style=invis]\n\tarr_item_sorted_suffixes_5_a_0 -> arr_item_sorted_suffixes_3_ana_0 [style=invis]\n\tarr_item_sorted_suffixes_3_ana_0 -> arr_item_sorted_suffixes_1_anana_0 [style=invis]\n\tarr_item_sorted_suffixes_1_anana_0 -> arr_item_sorted_suffixes_0_banana_0 [style=invis]\n\tarr_item_sorted_suffixes_0_banana_0 -> arr_item_sorted_suffixes_4_na_0 [style=invis]\n\tarr_item_sorted_suffixes_4_na_0 -> arr_item_sorted_suffixes_2_nana_0 [style=invis]\n{rank=same; arr_item_sorted_suffixes_0_banana_0 arr_item_sorted_suffixes_1_anana_0 arr_item_sorted_suffixes_2_nana_0 arr_item_sorted_suffixes_3_ana_0 arr_item_sorted_suffixes_4_na_0 arr_item_sorted_suffixes_5_a_0 }}\n"
        }
      ]
    },
    {
      "variable": "order",
      "kind": "dot",
      "compatibleViewKinds": [
        "auto",
        "array_cells",
        "bar",
        "heap_dual"
      ],
      "steps": [
        {
          "stepId": "step 5",
          "timelineKey": "0:5",
          "eventOrder": 20,
          "executionId": 0,
          "order": 5,
          "index": 0,
          "meta": {
            "var_id": 20,
            "access_path": "order",
            "access_paths": [
              "order"
            ],
            "scope_id": 0,
            "line_number": 12,
            "execution_id": 0,
            "order": 5
          },
          "dot": "digraph G {\n\tgraph [fontcolor=\"#0f172a\" fontname=Helvetica fontsize=16 label=<<font point-size='16' color='#0f172a'><b>order</b></font>> labeljust=c labelloc=t nodesep=0.006 rankdir=TB ranksep=0.06]\n\tnode [color=\"#1f2933\" fillcolor=\"#ffffff\" fontname=Helvetica shape=box style=\"rounded,filled\"]\n\tedge [color=\"#6b7280\" fontname=Helvetica]\n\tarr_exp_1 [label=\"\" height=0.01 shape=point style=invis width=0.01]\n\tarr_item_order_0_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_order_0_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">0</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>3</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-order-array-item-0-0\" penwidth=1.1 shape=plain]\n\tarr_item_order_1_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_order_1_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">1</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>2</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-order-array-item-1-0\" penwidth=1.1 shape=plain]\n\tarr_item_order_2_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_order_2_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">2</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>5</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-order-array-item-2-0\" penwidth=1.1 shape=plain]\n\tarr_item_order_3_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_order_3_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">3</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>1</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-order-array-item-3-0\" penwidth=1.1 shape=plain]\n\tarr_item_order_4_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_order_4_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">4</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>4</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-order-array-item-4-0\" penwidth=1.1 shape=plain]\n\tarr_item_order_5_0 [label=<<table border='1' cellborder='1' cellspacing='0' cellpadding='0'><tr><td port='arr_item_order_5_0_value' width='54' height='30' fixedsize='true' align='center' bgcolor='#ffffff' cellpadding='2'><font point-size=\"12\" color=\"#0f172a\">5</font></td></tr><tr><td align='center' bgcolor='#ffffff' cellpadding='1'><font color='#94a3b8' point-size='10'>0</font></td></tr></table>> color=\"#cbd5e1\" id=\"cv-order-array-item-5-0\" penwidth=1.1 shape=plain]\n\tarr_exp_1 -> arr_item_order_5_0 [style=invis]\n\tarr_item_order_5_0 -> arr_item_order_3_0 [style=invis]\n\tarr_item_order_3_0 -> arr_item_order_1_0 [style=invis]\n\tarr_item_order_1_0 -> arr_item_order_0_0 [style=invis]\n\tarr_item_order_0_0 -> arr_item_order_4_0 [style=invis]\n\tarr_item_order_4_0 -> arr_item_order_2_0 [style=invis]\n{rank=same; arr_item_order_0_0 arr_item_order_1_0 arr_item_order_2_0 arr_item_order_3_0 arr_item_order_4_0 arr_item_order_5_0 }}\n"
        }
      ]
    }
  ]
};
