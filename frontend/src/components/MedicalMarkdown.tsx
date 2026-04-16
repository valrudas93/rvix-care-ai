import React from "react";
import { Microscope, Search, ClipboardList, Info, ShieldAlert, Brain } from "lucide-react";

const SECTION_STYLES: Record<string, { icon: React.ElementType; iconColor: string; borderColor: string; bgColor: string; titleColor: string }> = {
  "Interpretación del Resultado": {
    icon: Microscope,
    iconColor: "text-blue-500",
    borderColor: "border-blue-200",
    bgColor: "bg-blue-50/60",
    titleColor: "text-blue-700",
  },
  "Hallazgos Relevantes": {
    icon: Search,
    iconColor: "text-amber-500",
    borderColor: "border-amber-200",
    bgColor: "bg-amber-50/60",
    titleColor: "text-amber-700",
  },
  "Plan de Acción Clínica": {
    icon: ClipboardList,
    iconColor: "text-emerald-500",
    borderColor: "border-emerald-200",
    bgColor: "bg-emerald-50/60",
    titleColor: "text-emerald-700",
  },
  "Consideraciones Adicionales": {
    icon: Info,
    iconColor: "text-purple-500",
    borderColor: "border-purple-200",
    bgColor: "bg-purple-50/60",
    titleColor: "text-purple-700",
  },
};

export const inlineFormat = (s: string) =>
  s
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="bg-muted px-1 rounded text-xs font-mono">$1</code>');

function SectionContent({ lines }: { lines: string[] }) {
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    elements.push(
      <ul key={key++} className="space-y-2 my-1">
        {listItems.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-current flex-shrink-0 opacity-50" />
            <span dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
          </li>
        ))}
      </ul>
    );
    listItems = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <p key={key++} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-3 mb-1 border-b border-border pb-1">
          {line.slice(4)}
        </p>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      listItems.push(line.slice(2));
    } else if (line === "" || line === "---") {
      flushList();
    } else {
      flushList();
      elements.push(
        <p
          key={key++}
          className="text-sm text-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: inlineFormat(line) }}
        />
      );
    }
  }
  flushList();
  return <div className="space-y-1.5">{elements}</div>;
}

export function MedicalMarkdown({ text }: { text: string }) {
  const rawSections = text.split(/^## /m).filter(Boolean);
  const sections: { title: string; lines: string[] }[] = [];
  let disclaimer = "";

  for (const raw of rawSections) {
    const firstNewline = raw.indexOf("\n");
    const title = firstNewline > -1 ? raw.slice(0, firstNewline).trim() : raw.trim();
    const body = firstNewline > -1 ? raw.slice(firstNewline + 1) : "";

    const dividerIdx = body.search(/^---/m);
    if (dividerIdx > -1) {
      sections.push({ title, lines: body.slice(0, dividerIdx).split("\n") });
      disclaimer = body.slice(dividerIdx).replace(/^---\n?/, "").trim();
    } else {
      sections.push({ title, lines: body.split("\n") });
    }
  }

  if (sections.length === 0) {
    return <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{text}</p>;
  }

  return (
    <div className="space-y-3">
      {sections.map(({ title, lines }, i) => {
        const style = SECTION_STYLES[title] ?? {
          icon: Brain,
          iconColor: "text-primary",
          borderColor: "border-primary/20",
          bgColor: "bg-primary/5",
          titleColor: "text-primary",
        };
        const Icon = style.icon;
        return (
          <div key={i} className={`rounded-lg border p-4 ${style.borderColor} ${style.bgColor}`}>
            <div className={`flex items-center gap-2 mb-3 ${style.titleColor}`}>
              <Icon className={`h-4 w-4 ${style.iconColor}`} />
              <span className="font-semibold text-sm">{title}</span>
            </div>
            <SectionContent lines={lines} />
          </div>
        );
      })}

      {disclaimer && (
        <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50/60 p-3 mt-2">
          <ShieldAlert className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p
            className="text-xs text-yellow-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: inlineFormat(disclaimer.replace(/^⚠️\s*/, "").replace(/\*/g, "")) }}
          />
        </div>
      )}
    </div>
  );
}
