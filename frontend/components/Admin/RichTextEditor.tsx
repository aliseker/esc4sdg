'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import { Plugin } from 'prosemirror-state';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Extension } from '@tiptap/core';
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import { BubbleMenu } from '@tiptap/react/menus';
import { ImagePlus, Link as LinkIcon, Unlink, AlignLeft, AlignCenter, AlignRight, Check } from 'lucide-react';
import { API_BASE } from '@/lib/adminApi';
import { adminUploadProjectInline } from '@/lib/adminApi';

/** Link içinde metin silindiğinde veya yazıldığında linki kaldırır. */
const UnsetLinkOnEdit = Extension.create({
  name: 'unsetLinkOnEdit',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction(transactions, oldState, newState) {
          if (oldState.doc.eq(newState.doc)) return null;
          const tr = transactions[0];
          if (!tr || !tr.docChanged) return null;
          const linkMarkType = newState.schema.marks.link;
          if (!linkMarkType) return null;
          const { from, to } = newState.selection;
          let linkFrom: number | null = null;
          let linkTo: number | null = null;
          newState.doc.nodesBetween(from, Math.max(to, from + 1), (node, pos) => {
            if (node.isText && node.marks.some((m) => m.type === linkMarkType)) {
              if (linkFrom === null) linkFrom = pos;
              linkTo = pos + node.nodeSize;
            }
          });
          if (linkFrom === null || linkTo === null) return null;
          while (linkFrom > 0) {
            let prevStart: number | null = null;
            newState.doc.nodesBetween(linkFrom - 1, linkFrom, (node, pos) => {
              if (node.isText && node.marks.some((m) => m.type === linkMarkType)) prevStart = pos;
            });
            if (prevStart === null) break;
            linkFrom = prevStart;
          }
          while (linkTo < newState.doc.content.size) {
            const node = newState.doc.nodeAt(linkTo);
            if (!node?.isText || !node.marks.some((m) => m.type === linkMarkType)) break;
            linkTo = linkTo + node.nodeSize;
          }
          const linkTr = newState.tr.removeMark(linkFrom, linkTo, linkMarkType);
          linkTr.setStoredMarks(linkTr.doc.resolve(linkTr.selection.from).marks());
          return linkTr;
        },
      }),
    ];
  },
});

/** Resme hizalama (sola / ortaya / sağa) ekleyen Image uzantısı. */
const ImageWithAlign = Image.extend({
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: null },
      height: { default: null },
      align: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute('data-align'),
        renderHTML: (attrs: Record<string, unknown>) => (attrs.align ? { 'data-align': attrs.align } : {}),
      },
    };
  },
});

// Image widths removed in favor of manual input

/** Resim URL'lerini editörde göstermek için base ekler; çıktıda tekrar relative yapar. */
function imageSrcToDisplay(html: string): string {
  if (!html || typeof html !== 'string') return html;
  return html.replace(
    /(\ssrc=)(["'])(\/uploads\/)/gi,
    `$1$2${API_BASE}$3`
  );
}
function imageSrcToStorage(html: string): string {
  if (!html || typeof html !== 'string') return html;
  const base = API_BASE.replace(/\/$/, '');
  return html.replace(new RegExp(`\\s+src=["']${base}(/uploads/[^"']+)["']`, 'gi'), ' src="$1"');
}

/** Resmi imleç konumuna ekler; seçili öğeyi değiştirmez, böylece birden fazla resim kalır. */
function insertImageNode(editor: Editor, src: string, alt: string) {
  editor.chain().focus().insertContent({ type: 'image', attrs: { src, alt } }).run();
}

// Font sizes removed in favor of manual input

export type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
  onUploadImage?: (file: File) => Promise<{ url: string }>;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Metin yazın...',
  disabled = false,
  minHeight = '160px',
  onUploadImage = adminUploadProjectInline,
}: RichTextEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkPopoverUrl, setLinkPopoverUrl] = useState('');
  const [imageUrlPopoverOpen, setImageUrlPopoverOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageInputKey, setImageInputKey] = useState(0);
  const [, setToolbarUpdate] = useState(0);
  const linkSelectionRef = useRef<{ from: number; to: number } | null>(null);

  const emitChange = useCallback(
    (html: string) => {
      onChange(imageSrcToStorage(html));
    },
    [onChange]
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank', rel: 'noopener' },
      }),
      ImageWithAlign.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { class: 'max-w-full h-auto rounded-lg' },
      }),
      TextStyle,
      FontSize,
      TextAlign.configure({
        types: ['paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
      UnsetLinkOnEdit,
    ],
    content: imageSrcToDisplay(value || ''),
    editable: !disabled,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[120px] px-3 py-2 focus:outline-none [&_a]:text-blue-600 [&_a]:underline [&_a]:cursor-pointer',
        style: `min-height: ${minHeight}`,
        spellcheck: 'false',
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;
        const file = files[0];
        if (!file.type.startsWith('image/')) return false;
        event.preventDefault();
        onUploadImage(file).then(
          ({ url }) => {
            if (!editor) return;
            const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
            insertImageNode(editor, fullUrl, file.name);
          },
          () => { }
        );
        return true;
      },
      handlePaste: (view, event) => {
        const files = event.clipboardData?.files;
        if (!files?.length) return false;
        const file = Array.from(files).find((f) => f.type.startsWith('image/'));
        if (!file) return false;
        event.preventDefault();
        onUploadImage(file).then(
          ({ url }) => {
            if (!editor) return;
            const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
            insertImageNode(editor, fullUrl, file.name);
          },
          () => { }
        );
        return true;
      },
    },
    onUpdate: ({ editor }) => {
      emitChange(editor.getHTML());
    },
  });

  // Dışarıdan value değişince (örn. dil alanı değişimi) içeriği senkronize et; kullanıcı yazarken üzerine yazma
  useEffect(() => {
    if (!editor) return;

    // Eğer editör odaklanmışsa (kullanıcı yazıyorsa) dışarıdan gelen güncellemeyi yoksay
    // Bu, "jumping cursor" ve seçim kaybolma sorunlarını engeller
    if (editor.isFocused) return;

    const fromParent = (valueRef.current || '').trim();
    const fromEditor = imageSrcToStorage(editor.getHTML()).trim();

    // Sadece içerik gerçekten farklıysa güncelle
    if (fromParent !== fromEditor) {
      editor.commands.setContent(imageSrcToDisplay(valueRef.current || ''), { emitUpdate: false });
    }
  }, [editor, value]);

  // Toolbar ikonlarının seçim/transaction sonrası güncellenmesi (debounce ile sonsuz döngü önlenir)
  const toolbarUpdateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!editor) return;
    const onUpdate = () => {
      if (toolbarUpdateTimeoutRef.current) return;
      toolbarUpdateTimeoutRef.current = setTimeout(() => {
        toolbarUpdateTimeoutRef.current = null;
        setToolbarUpdate((k) => k + 1);
      }, 50);
    };
    editor.on('selectionUpdate', onUpdate);
    editor.on('transaction', onUpdate);
    return () => {
      if (toolbarUpdateTimeoutRef.current) clearTimeout(toolbarUpdateTimeoutRef.current);
      editor.off('selectionUpdate', onUpdate);
      editor.off('transaction', onUpdate);
    };
  }, [editor]);

  const openLinkPopover = () => {
    if (!editor) return;
    if (editor.isActive('link')) {
      setLinkPopoverOpen(false);
      const tr = editor.state.tr;
      const marks = editor.state.selection.$from.marks().filter((m) => m.type.name !== 'link');
      tr.setStoredMarks(marks);
      editor.view.dispatch(tr);
      return;
    }
    const { from, to } = editor.state.selection;
    if (from !== to) linkSelectionRef.current = { from, to };
    const previous = editor.getAttributes('link').href ?? '';
    setLinkPopoverUrl(previous || 'https://');
    setLinkPopoverOpen(true);
  };

  const applyLink = () => {
    if (!editor) return;
    const trimmed = linkPopoverUrl.trim();
    if (trimmed === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setLinkPopoverOpen(false);
      linkSelectionRef.current = null;
      return;
    }
    if (/^https?:?\s*$/.test(trimmed)) return; // eksik URL, popover açık kalsın
    const href = trimmed.includes('://') ? trimmed : `https://${trimmed}`;
    const sel = linkSelectionRef.current;
    const hadSelection = sel && sel.from !== sel.to;

    if (hadSelection && sel) {
      const { doc, schema } = editor.state;
      const linkMark = schema.marks.link;
      if (linkMark) {
        const from = Math.min(sel.from, sel.to);
        const to = Math.max(sel.from, sel.to);
        const tr = editor.state.tr
          .setSelection(TextSelection.create(doc, from, to))
          .addMark(from, to, linkMark.create({ href }));
        tr.setStoredMarks(tr.selection.$from.marks().filter((m) => m.type.name !== 'link'));
        editor.view.dispatch(tr);
      }
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    }
    setLinkPopoverOpen(false);
    linkSelectionRef.current = null;
  };

  const insertImageByUrl = () => {
    const url = imageUrlInput.trim();
    if (!url || !editor) return;
    const href = url.includes('://') ? url : `https://${url}`;
    insertImageNode(editor, href, '');
    setImageUrlInput('');
    setImageUrlPopoverOpen(false);
  };

  const insertImage = () => {
    inputRef.current?.click();
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    onUploadImage(file).then(
      ({ url }) => {
        const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
        insertImageNode(editor, fullUrl, file.name);
        setImageInputKey((k) => k + 1); // aynı dosyayı tekrar seçebilmek için input'u yenile
      },
      () => { }
    );
    e.target.value = '';
  };

  if (!editor) {
    return (
      <div className="rounded-lg border border-stone-200 bg-stone-50/50" style={{ minHeight }}>
        <div className="flex items-center gap-1 p-2 border-b border-stone-200 bg-stone-100/80 rounded-t-lg" />
        <div className="px-3 py-2 text-stone-400 text-sm">{placeholder}</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-stone-200 bg-stone-50">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Kalın"
        >
          <BoldIcon />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="İtalik"
        >
          <ItalicIcon />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Altı çizili"
        >
          <UnderlineIcon />
        </ToolbarButton>
        <span className="w-px h-5 bg-stone-300 mx-0.5" />
        <ToolbarButton
          onClick={() => { editor.chain().focus().run(); editor.commands.setTextAlign('left'); }}
          active={editor.getAttributes('paragraph').textAlign === 'left'}
          title="Sola hizala"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => { editor.chain().focus().run(); editor.commands.setTextAlign('center'); }}
          active={editor.getAttributes('paragraph').textAlign === 'center'}
          title="Ortala"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => { editor.chain().focus().run(); editor.commands.setTextAlign('right'); }}
          active={editor.getAttributes('paragraph').textAlign === 'right'}
          title="Sağa hizala"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        <span className="w-px h-5 bg-stone-300 mx-0.5" />
        <span className="w-px h-5 bg-stone-300 mx-0.5" />
        <FontSizeInput editor={editor} />
        <span className="w-px h-5 bg-stone-300 mx-0.5" />
        <div className="relative inline-block">
          <ToolbarButton
            onMouseDown={(e) => {
              e.preventDefault();
              if (editor && !editor.isActive('link')) {
                const { from, to } = editor.state.selection;
                linkSelectionRef.current = { from, to };
              }
            }}
            onClick={openLinkPopover}
            active={editor.isActive('link')}
            title="Link ekle: Metni seçin, tıklayın, açılan kutuya URL yazın (örn. https://google.com)"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
          {linkPopoverOpen && (
            <div className="absolute left-0 top-full mt-1 z-50 min-w-[280px] p-3 rounded-xl border border-stone-200 bg-white shadow-lg">
              <label className="block text-xs font-medium text-stone-600 mb-1.5">Link adresi (URL)</label>
              <input
                type="url"
                value={linkPopoverUrl}
                onChange={(e) => setLinkPopoverUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyLink(); } if (e.key === 'Escape') setLinkPopoverOpen(false); }}
                placeholder="https://www.example.com"
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                autoFocus
                spellCheck={false}
              />
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={applyLink} className="px-3 py-1.5 text-sm rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700">
                  Ekle
                </button>
                <button type="button" onClick={() => setLinkPopoverOpen(false)} className="px-3 py-1.5 text-sm rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50">
                  İptal
                </button>
              </div>
            </div>
          )}
        </div>
        <ToolbarButton
          onClick={() => editor.chain().focus().extendMarkRange('link').unsetLink().run()}
          active={false}
          title="Linki kaldır: Seçili metindeki linki kaldırır (metin kalır, link olmaz)"
        >
          <Unlink className="w-4 h-4" />
        </ToolbarButton>
        <span className="w-px h-5 bg-stone-300 mx-0.5" />
        <div className="relative inline-block">
          <ToolbarButton onClick={insertImage} active={false} title="Resim ekle (dosyadan)">
            <ImagePlus className="w-4 h-4" />
          </ToolbarButton>
          <button
            type="button"
            onClick={() => { setImageUrlInput(''); setImageUrlPopoverOpen((v) => !v); }}
            className="ml-0.5 p-1.5 rounded hover:bg-stone-200 text-stone-600 text-xs font-medium"
            title="Aynı veya farklı resmi URL ile ekle (aynı resmi birden fazla kez ekleyebilirsiniz)"
          >
            URL
          </button>
          {imageUrlPopoverOpen && (
            <div className="absolute left-0 top-full mt-1 z-50 min-w-[280px] p-3 rounded-xl border border-stone-200 bg-white shadow-lg">
              <label className="block text-xs font-medium text-stone-600 mb-1.5">Resim adresi (URL)</label>
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); insertImageByUrl(); } if (e.key === 'Escape') setImageUrlPopoverOpen(false); }}
                placeholder="https://... veya /uploads/..."
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                autoFocus
                spellCheck={false}
              />
              <p className="text-xs text-stone-500 mt-1">Aynı URL’yi birden fazla kez ekleyebilirsiniz.</p>
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={insertImageByUrl} className="px-3 py-1.5 text-sm rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700">
                  Ekle
                </button>
                <button type="button" onClick={() => setImageUrlPopoverOpen(false)} className="px-3 py-1.5 text-sm rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50">
                  İptal
                </button>
              </div>
            </div>
          )}
        </div>
        <input
          key={imageInputKey}
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageFile}
        />
      </div>
      <EditorContent editor={editor} className="rich-text-editor-content" />
      {/* Resim seçildiğinde: boyut ve hizalama (Word tarzı) */}
      <BubbleMenu
        editor={editor}
        shouldShow={({ state }) => {
          const sel = state.selection;
          return sel instanceof NodeSelection && sel.node.type.name === 'image';
        }}
        options={{ placement: 'top' }}
        className="flex flex-wrap items-center gap-1 p-2 rounded-lg shadow-lg border border-stone-200 bg-white"
      >
        <span className="text-xs text-stone-500 mr-1">Boyut:</span>
        <ImageWidthInput editor={editor} />
        <span className="text-xs text-stone-500 ml-2 mr-1">Hizalama:</span>
        {[
          { value: 'left', Icon: AlignLeft, title: 'Sola' },
          { value: 'center', Icon: AlignCenter, title: 'Ortaya' },
          { value: 'right', Icon: AlignRight, title: 'Sağa' },
        ].map(({ value, Icon, title }) => (
          <button
            key={value}
            type="button"
            title={title}
            onClick={() => editor.chain().focus().updateAttributes('image', { align: value }).run()}
            className={`p-1.5 rounded hover:bg-stone-200 ${editor.getAttributes('image').align === value ? 'bg-amber-100 text-amber-800' : 'text-stone-600'}`}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </BubbleMenu>
      {/* Resim hizalaması: data-align ile sola/ortaya/sağa */}
      <style dangerouslySetInnerHTML={{
        __html: `
.rich-text-editor-content img[data-align="center"] { display: block; margin-left: auto; margin-right: auto; }
.rich-text-editor-content img[data-align="right"] { display: block; margin-left: auto; margin-right: 0; }
.rich-text-editor-content img[data-align="left"] { display: block; margin-right: auto; margin-left: 0; }
        `.trim(),
      }} />
    </div>
  );
}

// Helper type for ToolbarButton
type ToolbarButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  title: string;
  onMouseDown?: (e: React.MouseEvent) => void;
};

function ToolbarButton({
  children,
  onClick,
  active,
  title,
  onMouseDown,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onMouseDown?.(e);
      }}
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded hover:bg-stone-200 ${active ? 'bg-amber-100 text-amber-800' : 'text-stone-600'}`}
    >
      {children}
    </button>
  );
}

function BoldIcon() {
  return <span className="font-bold text-sm">B</span>;
}
function ItalicIcon() {
  return <span className="italic text-sm">İ</span>;
}
function UnderlineIcon() {
  return <span className="underline text-sm">A</span>;
}

function FontSizeInput({ editor }: { editor: Editor }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const update = () => {
      const current = editor.getAttributes('textStyle').fontSize;
      // Do not update if input is focused to avoid overwriting user typing
      if (document.activeElement?.tagName === 'INPUT' && document.activeElement.getAttribute('data-id') === 'font-size-input') return;
      setValue(current ? String(current).replace('pt', '').replace('px', '') : '');
    };

    editor.on('transaction', update);
    editor.on('selectionUpdate', update);
    update();

    return () => {
      editor.off('transaction', update);
      editor.off('selectionUpdate', update);
    };
  }, [editor]);

  // Debounced Apply
  useEffect(() => {
    const timer = setTimeout(() => {
      // Basic validation: Check if value is different from current to avoid redundant commands
      const current = editor.getAttributes('textStyle').fontSize;
      const currentVal = current ? String(current).replace('pt', '').replace('px', '') : '';
      if (value === currentVal) return;

      const v = value.trim();
      // Only apply if user is typing a valid number or empty
      if (!v) {
        editor.chain().unsetFontSize().run(); // No focus call
      } else if (/^\d+$/.test(v)) {
        editor.chain().setFontSize(`${v}pt`).run(); // No focus call to keep input focus
      }
    }, 600); // 600ms wait after typing stops

    return () => clearTimeout(timer);
  }, [value, editor]);

  const commit = () => {
    // Force apply and focus back to editor on Enter
    const v = value.trim();
    if (v && /^\d+$/.test(v)) {
      editor.chain().focus().setFontSize(`${v}pt`).run();
    } else {
      editor.chain().focus().unsetFontSize().run();
    }
  };

  return (
    <div className="flex items-center gap-1" title="Yazı boyutu (pt)">
      <span className="text-xs text-stone-500">Boyut:</span>
      <input
        data-id="font-size-input"
        type="text"
        className="text-xs border border-stone-200 rounded px-1 py-1 w-12 text-center bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
        placeholder="16"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } }}
      />
    </div>
  );
}

function ImageWidthInput({ editor }: { editor: Editor }) {
  const [value, setValue] = useState('');
  const [placeholder, setPlaceholder] = useState('Oto');

  useEffect(() => {
    const update = () => {
      const attrs = editor.getAttributes('image');
      const w = attrs.width;

      let currentRendered = '';
      try {
        const { from } = editor.state.selection;
        // Safety check for view.dom availability
        if (editor.view && editor.view.dom) {
          const selNode = editor.view.dom.querySelector('.ProseMirror-selectednode');
          if (selNode instanceof HTMLImageElement) {
            currentRendered = String(selNode.offsetWidth);
          } else if (selNode) {
            const img = selNode.querySelector('img');
            if (img) currentRendered = String(img.offsetWidth);
          }
        }
      } catch (e) { /* ignore */ }

      if (currentRendered) setPlaceholder(currentRendered);
      else setPlaceholder('Oto');

      if (document.activeElement?.tagName === 'INPUT' && document.activeElement.getAttribute('data-id') === 'image-width-input') return;
      setValue(w != null ? String(w) : '');
    };

    editor.on('transaction', update);
    editor.on('selectionUpdate', update);
    setTimeout(update, 100);

    return () => {
      editor.off('transaction', update);
      editor.off('selectionUpdate', update);
    };
  }, [editor]);

  // Debounced apply
  useEffect(() => {
    const timer = setTimeout(() => {
      const attrs = editor.getAttributes('image');
      const w = attrs.width;
      const currentVal = w != null ? String(w) : '';
      if (value === currentVal) return;

      const v = value.trim();
      editor.chain().updateAttributes('image', {
        width: v ? Number(v) : null,
        height: null,
      }).run(); // No focus call
    }, 600);

    return () => clearTimeout(timer);
  }, [value, editor]);

  const commit = () => {
    const v = value.trim();
    editor.chain().focus().updateAttributes('image', {
      width: v ? Number(v) : null,
      height: null,
    }).run();
  };

  return (
    <>
      <span className="text-xs text-stone-500 mr-1">Genişlik (px):</span>
      <input
        data-id="image-width-input"
        type="number"
        className="text-xs border border-stone-200 rounded px-1 py-1 w-16 bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } }}
      />
    </>
  );
}
