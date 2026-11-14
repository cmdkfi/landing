export function attachStoryTabs() {
  const stage = document.querySelector<HTMLElement>('.ltv-stage');
  if (!stage) return () => {};
  const tabs = Array.from(stage.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const panels = Array.from(stage.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
  const descriptions = Array.from(stage.querySelectorAll<HTMLElement>('.story-description'));
  function select(index: number, focus = false) {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
      descriptions[i].hidden = i !== index;
    });
    if (focus) tabs[index].focus();
    window.dispatchEvent(new Event('resize'));
  }
  const handlers = tabs.map((tab, index) => {
    const click = () => select(index);
    const key = (event: KeyboardEvent) => {
      let next = index;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault(); select(next, true);
    };
    tab.addEventListener('click', click); tab.addEventListener('keydown', key);
    return () => { tab.removeEventListener('click', click); tab.removeEventListener('keydown', key); };
  });
  return () => handlers.forEach(remove => remove());
}
