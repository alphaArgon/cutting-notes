# 多行夹注 / Cutting Notes

在网页中创建多行夹注。  
Create cutting notes in your web pages.

## 使用方法 / Usage

引入 `cutting-note.js`，然后…  
Includes `cutting-note.js` and then...

```js
makeCuttingNote(element, lineCount?, innerHTML?, averageCharacterWidth?);
```

如果内容需要更新，你需要手动再次调用这个函数。  
You need to call this function manually if the contents need to be updated.

## 演示 / Demos

- [Demo A](./demos/demo.a.html)
- [Demo B](./demos/demo.b.html)

## 参数 / Parameters

- `element: HTMLElement`

   要对其内部作夹注的 HTML 元素。  
   An HTML element to be made a cutting note inside.

-  `lineCount: number`

   夹注行数，默认值为 2。  
   The max line count per segment in the cutting note. The default value is `2`.

- `innerHTML: string`

   如果不提供，将以 `element.textContent` 作为内部内容。  
   If not provided, `element.textContent` will be the inner content of the cutting note.

- `averageCharacterWidth: number`

   字符平均宽度，默认值为 `0.8`。对于汉字，可以传以 `1`。  
   The average width of the characters. The default value is `0.8`. For common Western text, you can pass `0.6`.

## 讨论 / Discussion

### 性能 / Performance

**慢**。如果你的网页中有很多夹注，考虑使用 `setTimeOut` 或者懒加载。异步渲染注意夹注先后顺序。  
**Slow**. Consider making use of `setTimeOut` or lazy loading if there are lots of cutting notes in a webpage. Take care of the order of notes in async rendering.

### 富文本 / Rich Texts

如果不传入 `innerHTML`，`makeCuttingNote` 将使用 `element` 的 `textContent` 作为夹注内容。如果你不需要富文本，可以一直忽略 `innerHTML`，因为该函数虽然改变了内部 DOM 结构，但并不会改变文字内容。  
If `innerHTML` is not passed, `makeCuttingNote` will use `textContent` of `element` as the note content. If you do not need rich texts, you can always omit `innerHTML` because though this function may change the DOM structure of an element, the text content of it stays the same.

注意，耗时与 `innerHTML` 的复杂度呈正相关，如果你确信某些子元素内部不会换行，可以考虑用等宽度的文本代替该元素，在该函数执行结束后再从 `element.innerHTML` 替换回来。  
Note that the time-consuming and the complexity of `innerHTML` have a positive correlation. If a child element will never wrap, you may replace it with a text placeholder of the same width, and then replace the placeholder back in `element.innerHTML` after the function is executed.

### 耐操性 / Robustness

如果输入看起来很正常，那么输出也不会很糟糕。注意，父容器的边界必须是矩形。另外，如果有偏离 inline box 较大的内部元素，可能会干扰行数判断。  
The normal input, the normal out. Note that the internal boundary of the parent element must be a rectangle. And, an inner element derailed greatly from the inline box may interfere with the detection of the line count.

在 Internet Explorer 下不稳定。  
Not stable in Internet Explorer.
