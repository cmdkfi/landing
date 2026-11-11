const palette = document.querySelector<HTMLDialogElement>('[data-command-dialog]');
if (palette && typeof palette.showModal === 'function') {
  const toggle = () => palette.open ? palette.close() : palette.showModal();
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-command-open]')) {
    button.hidden = false;
    button.addEventListener('click', toggle);
  }
  if (!/Mac|iPhone|iPad/.test(navigator.platform)) {
    for (const hint of document.querySelectorAll<HTMLElement>('[data-shortcut]')) hint.textContent = hint.dataset.other ?? '';
  }
  document.addEventListener('keydown', (event) => {
    // Keep editor shortcuts and other dialogs in control of their own keyboard input.
    if (event.defaultPrevented || event.repeat || event.isComposing || event.altKey || event.shiftKey ||
        !(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k' ||
        (event.target as HTMLElement)?.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])') ||
        document.querySelector('dialog[open]:not([data-command-dialog])')) return;
    event.preventDefault();
    toggle();
  });
  palette.addEventListener('click', (event) => {
    const link = (event.target as Element).closest('a');
    if (link) {
      // Close before the shared agent handler opens its dialog.
      palette.close();
      document.querySelector('[data-mobile-menu]')?.removeAttribute('open');
      if (link.hash === '#status') document.querySelector<HTMLDetailsElement>('[data-directory-disclosure]')?.setAttribute('open', '');
    } else if (event.target === palette) {
      const r = palette.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) palette.close();
    }
  });
}
