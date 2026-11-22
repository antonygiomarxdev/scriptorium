# Diagrams

Draw a diagram when it shows faster than text: how parts connect, the order of steps, the states an object moves through. The text still says the same thing; the diagram is how a reader sees it at once.

## Where a diagram is required
- A TP's Architecture: a flowchart of the parts and what each sends to the next.
- Each flow of a UX document: a flowchart, one per flow, whose steps cite FR and EX ids.
- An FRD's States, unless it says "n/a: <reason>": a stateDiagram-v2, with the transitions that must not happen as ST rows.
- PRODUCT and PRD: optional, when it explains faster than text.

## Which diagram answers which question
| Question | Type |
|---|---|
| What are the parts and how do they connect? | flowchart |
| In what order do two or more parts talk? | sequenceDiagram |
| What states does an object move through? | stateDiagram-v2 |
| What data is kept and how is it related? | erDiagram |
| What types and members does the code share? | classDiagram |

Use only these five. GitHub renders them with nothing installed; newer or beta types may not render on GitHub, and the docs lint fails them.

## Keep it small
- One question per diagram. Split an overview from its detail instead of growing one diagram.
- 15 nodes or fewer. The lint warns above 15.
- Short labels, one line each. Label every arrow whose meaning is not obvious.

## Keep it renderable
- Quote a label that holds ( ) [ ] { } : or other punctuation: A["Book (slot)"].
- No HTML in a label, not even <br>.
- Never name a node end in lowercase; write End.
- No styling, colors or themes: GitHub's light and dark modes choose them.
- Never install a renderer or download a browser to check a diagram; push it and look at it on GitHub.

## Cite the rows
A step that is a system response cites its FR id, a branch the examples cover cites its EX id, a transition cites its ST id. A diagram with no ids cannot be traced by any check.
