function makeCuttingNote(element, lineCount = 2, innerHTML, averageCharacterWidth = 0.8) {
    let parent = element.parentElement;
    let parentStyle = getComputedStyle(parent);
    let elementStyle = getComputedStyle(element);

    let isVertical = ["vertical-rl", "vertical-lr", "tb", "tb-rl", "tb-lr"].indexOf(parentStyle.writingMode) > -1;
    if(isVertical) {
        var kBlockSize = "width";
        var kInlineSize = "height";
        var kOffsetInlineStart = "offsetTop";
        var kClientBlockSize = "clientWidth";
        var kClientInlineSize = "clientHeight";
        var kScrollBlockSize = "scrollWidth";
        var kScrollInlineSize = "scrollHeight";
        var kPaddingInlineStart = "paddingTop";
        var kPaddingInlineEnd = "paddingBottom";
        var kBorderInlineStart = "borderTop";
        var kBorderInlineEnd = "borderBottom";
        var kCSSMarginInlineEnd = "margin-bottom";
    } else {
        var kBlockSize = "height";
        var kInlineSize = "width";
        var kOffsetInlineStart = "offsetLeft";
        var kClientBlockSize = "clientHeight";
        var kClientInlineSize = "clientWidth";
        var kScrollBlockSize = "scrollHeight";
        var kScrollInlineSize = "scrollWidth";
        var kPaddingInlineStart = "paddingLeft";
        var kPaddingInlineEnd = "paddingRight";
        var kBorderInlineStart = "borderLeft";
        var kBorderInlineEnd = "borderRight";
        var kCSSMarginInlineEnd = "margin-right";
    }

    let blockSizeTestText;
    if(innerHTML === undefined) {
        blockSizeTestText = element.textContent = element.textContent;
        innerHTML = element.innerHTML;
    } else {
        blockSizeTestText = element.textContent;
    }

    element.innerHTML = "";

    let fontSize = parseInt(elementStyle.fontSize);

    let maxInlineSize = parent[kClientInlineSize]
        - (parseInt(parentStyle[kPaddingInlineStart]) || 0)
        - (parseInt(parentStyle[kPaddingInlineEnd]) || 0);

    if(maxInlineSize <= fontSize) {
        element.innerHTML = innerHTML;
        return;
    }

    let firstLineStartPadding =
        + (parseInt(elementStyle[kPaddingInlineStart]) || 0)
        + (parseInt(elementStyle[kBorderInlineStart]) || 0);

    let firstLineEndPadding =
        + (parseInt(elementStyle[kPaddingInlineEnd]) || 0)
        + (parseInt(elementStyle[kBorderInlineEnd]) || 0);

    let firstLineMaxInlineSize = maxInlineSize - (element.offsetParent === parent
        ? element[kOffsetInlineStart]
        : element[kOffsetInlineStart] - parent[kOffsetInlineStart])
        + (parseInt(parentStyle[kPaddingInlineStart]) || 0)
        - firstLineStartPadding;

    if(firstLineMaxInlineSize <= fontSize) {firstLineMaxInlineSize = maxInlineSize - firstLineStartPadding;}

    let testElement = document.createElement("c");
    testElement.innerHTML = blockSizeTestText;
    for(let i = 1; i < lineCount; ++i) {testElement.innerHTML += "<br>" + blockSizeTestText;}
    testElement.setAttribute("style", "position: fixed; visibility: hidden; white-space: nowrap;");
    element.appendChild(testElement);

    let stepScale = 1.25;
    let blockSize = testElement[kClientBlockSize];
    let blockSizeTolerance = fontSize / 2;

    if((blockSize + blockSizeTolerance) / lineCount <= fontSize) {
        element.innerHTML = innerHTML;
        return;
    }

    testElement.style[kBlockSize] = blockSize + "px";
    testElement.style.display = "block";
    testElement.style.whiteSpace = "";
    testElement.innerHTML = innerHTML;

    let fragment = document.createDocumentFragment();

    let isFirstLine = true;
    let hasAppendSegment = false;

    while(true) {
        let initialTestInlineSize = isFirstLine
            ? firstLineMaxInlineSize : hasAppendSegment
            ? maxInlineSize
            : maxInlineSize - firstLineStartPadding;
        testElement.style[kInlineSize] = initialTestInlineSize + "px";

        let inlineSize;
        let range = document.createRange();
        range.setStart(testElement, 0);

        if(testElement[kScrollBlockSize] <= blockSize + blockSizeTolerance) {
            range.setEnd(testElement, testElement.childNodes.length);
            let textLength = testElement.textContent.length;
            inlineSize = Math.min(initialTestInlineSize, textLength * fontSize * averageCharacterWidth / lineCount);
            let maxInlineSize = Math.min(initialTestInlineSize, inlineSize * stepScale + 1) | 0;
            let minInlineSize = Math.min(maxInlineSize, Math.max(1, inlineSize / stepScale - 1)) | 0;

            let needsTestMin = true;

            while(minInlineSize < maxInlineSize) {
                testElement.style[kInlineSize] = maxInlineSize + "px";
                if(testElement[kScrollBlockSize] <= blockSize + blockSizeTolerance
                && testElement[kScrollInlineSize] <= maxInlineSize) {
                    break;
                } else {
                    minInlineSize = maxInlineSize;
                    maxInlineSize = Math.min(initialTestInlineSize, maxInlineSize * stepScale + 1) | 0;
                    needsTestMin = false;
                }
            }

            while(needsTestMin && minInlineSize < maxInlineSize) {
                testElement.style[kInlineSize] = minInlineSize + "px";
                if(testElement[kScrollBlockSize] > blockSize + blockSizeTolerance
                || testElement[kScrollInlineSize] > minInlineSize) {
                    break;
                } else {
                    maxInlineSize = minInlineSize;
                    minInlineSize = Math.max(1, minInlineSize / stepScale - 1) | 0;
                }
            }

            inlineSize = minInlineSize;

            while(minInlineSize < maxInlineSize) {
                inlineSize = Math.ceil((minInlineSize + maxInlineSize) / 2);
                if(inlineSize === maxInlineSize) {break;}

                testElement.style[kInlineSize] = inlineSize + "px";
                if(testElement[kScrollBlockSize] > blockSize + blockSizeTolerance
                || testElement[kScrollInlineSize] > inlineSize) {
                    minInlineSize = inlineSize;
                } else {
                    maxInlineSize = inlineSize;
                }
            }

        } else {
            inlineSize = initialTestInlineSize;
            let node = testElement;
            let textLengthBefore = 0;
            let approximateTextLength = inlineSize * lineCount / averageCharacterWidth / fontSize | 0;

            while(true) {
                let totalOffset;
                let offset;
                let childNodesTextLengths;

                while(true) {
                    let childNodes = node.childNodes;
                    if(childNodes.length !== 1) {
                        childNodesTextLengths = Array.prototype.map.call(childNodes, n => n.textContent?.length ?? 0);
                        break;
                    }
                    node = childNodes[0];
                }

                let isTextNode = node.nodeType === Node.TEXT_NODE;

                if(isTextNode) {
                    totalOffset = node.textContent.length;
                    offset = Math.min(totalOffset, inlineSize * lineCount / averageCharacterWidth / fontSize);
                } else {
                    totalOffset = childNodesTextLengths.length;

                    let totalTextLength = childNodesTextLengths.reduce((p, l) => p + l);
                    let increasingTextLength = childNodesTextLengths[0];
                    let approximateTextLengthInNode = Math.min(totalTextLength, approximateTextLength - textLengthBefore);

                    offset = 0;
                    while(offset < childNodesTextLengths.length) {
                        if(approximateTextLengthInNode >= increasingTextLength
                        && approximateTextLengthInNode <= (increasingTextLength += childNodesTextLengths[offset + 1])) {
                            break;
                        } else {
                            ++offset;
                        }
                    }
                }

                let maxOffset = Math.min(totalOffset, offset * stepScale + 1) | 0;
                let minOffset = Math.min(maxOffset, Math.max(0, offset / stepScale - 1)) | 0;

                let needsTestMin = true;

                while(minOffset < maxOffset) {
                    range.setEnd(node, maxOffset);
                    if(range.getBoundingClientRect()[kBlockSize] > blockSize + blockSizeTolerance) {
                        break;
                    } else {
                        minOffset = maxOffset;
                        maxOffset = Math.min(totalOffset, maxOffset * stepScale + 1) | 0;
                        needsTestMin = false;
                    }
                }

                while(needsTestMin && minOffset < maxOffset) {
                    if(minOffset === 0 && node !== testElement) {
                        let parent = node.parentNode;
                        range.setEnd(parent, Array.prototype.indexOf.call(parent.childNodes, node));
                    } else {
                        range.setEnd(node, minOffset);
                    }
                    if(range.getBoundingClientRect()[kBlockSize] <= blockSize + blockSizeTolerance) {
                        break;
                    } else {
                        maxOffset = minOffset;
                        minOffset = Math.max(0, minOffset / stepScale - 1) | 0;
                    }
                }

                offset = minOffset;

                while(minOffset < maxOffset) {
                    let shouldBreak = false;
                    if(isTextNode) {
                        offset = Math.floor((minOffset + maxOffset) / 2);
                        if(offset === minOffset) {shouldBreak = true;}
                    } else {
                        offset = Math.ceil((minOffset + maxOffset) / 2);
                        if(offset === maxOffset) {shouldBreak = true;}
                    }

                    if(offset === 0 && node !== testElement) {
                        let parent = node.parentNode;
                        range.setEnd(parent, Array.prototype.indexOf.call(parent.childNodes, node));
                    } else {
                        range.setEnd(node, offset);
                    }

                    if(isFirstLine && range.getBoundingClientRect()[kInlineSize] > inlineSize) {
                        inlineSize = 0;
                        break;
                    } 

                    if(shouldBreak) {break;}

                    if(range.getBoundingClientRect()[kBlockSize] <= blockSize + blockSizeTolerance) {
                        minOffset = offset;
                    } else {
                        maxOffset = offset;
                    }
                }

                if(isTextNode) {
                    break;
                } else {
                    for(let i = 0; i < offset - 1; ++i) {textLengthBefore += childNodesTextLengths[i];}
                    node = node.childNodes[Math.max(0, offset - 1)];
                }
            }
        }

        if(inlineSize === 0) {
            range.detach();
            isFirstLine = false;
            continue;
        }

        let span = document.createElement("span");
        span.appendChild(range.extractContents());
        span.setAttribute("style", isFirstLine
            ? `display: inline-block; ${kInlineSize}: ${inlineSize}px; ${kCSSMarginInlineEnd}: ${-1 - firstLineEndPadding}px;`
            : `display: inline-block; ${kInlineSize}: ${inlineSize}px;`);
        fragment.appendChild(span);
        hasAppendSegment = true;

        let firstChild = testElement.firstChild;
        if(firstChild !== null && firstChild.nodeType === Node.TEXT_NODE && firstChild.textContent === "") {
            testElement.removeChild(firstChild);
        } else if(firstChild === null) {
            break;
        }

        range.detach();
        isFirstLine = false;
    }

    element.removeChild(testElement);
    element.appendChild(fragment);
}

makeCuttingNote.version = "0.1.1";
