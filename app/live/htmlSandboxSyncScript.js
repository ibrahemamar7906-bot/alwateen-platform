// Injected into the iframe to synchronize mouse and keyboard events

export const sandboxSyncScript = `
  <script>
    (function() {
      // Notify parent we are ready
      window.parent.postMessage({ type: 'sandbox_init' }, '*');

      let isLocalInteraction = false;
      let syncTimeout = null;

      // Throttle function for mouse moves
      function throttle(callback, delay) {
        let lastCall = 0;
        return function(...args) {
          const now = new Date().getTime();
          if (now - lastCall < delay) return;
          lastCall = now;
          return callback(...args);
        };
      }

      // 1. Sync Mouse Move
      window.addEventListener('mousemove', throttle((e) => {
        if (isLocalInteraction) return; // Prevent loop
        window.parent.postMessage({
          type: 'sandbox_sync',
          event: 'mousemove',
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight
        }, '*');
      }, 50));

      // 2. Sync Click
      window.addEventListener('click', (e) => {
        if (isLocalInteraction) return;
        window.parent.postMessage({
          type: 'sandbox_sync',
          event: 'click',
          path: getDomPath(e.target),
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight
        }, '*');
      }, true);

      // 2.1 Sync Mouse Down
      window.addEventListener('mousedown', (e) => {
        if (isLocalInteraction) return;
        window.parent.postMessage({
          type: 'sandbox_sync',
          event: 'mousedown',
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight
        }, '*');
      }, true);

      // 2.2 Sync Mouse Up
      window.addEventListener('mouseup', (e) => {
        if (isLocalInteraction) return;
        window.parent.postMessage({
          type: 'sandbox_sync',
          event: 'mouseup',
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight
        }, '*');
      }, true);

      // 3. Sync Inputs
      window.addEventListener('input', (e) => {
        if (isLocalInteraction) return;
        const target = e.target;
        if (!target.tagName) return;
        
        // Find a way to identify the element
        let path = getDomPath(target);
        if (!path) return;
        
        window.parent.postMessage({
          type: 'sandbox_sync',
          event: 'input',
          path: path,
          value: target.value,
          checked: target.checked
        }, '*');
      }, true);

      // 4. Sync Scroll
      window.addEventListener('scroll', throttle((e) => {
        if (isLocalInteraction) return;
        window.parent.postMessage({
          type: 'sandbox_sync',
          event: 'scroll',
          scrollX: window.scrollX / (document.documentElement.scrollWidth - window.innerWidth || 1),
          scrollY: window.scrollY / (document.documentElement.scrollHeight - window.innerHeight || 1)
        }, '*');
      }, 100), true);

      // 5. Sync Drag and Drop
      let lastDraggedPath = null;
      window.addEventListener('dragstart', (e) => {
        if (isLocalInteraction) return;
        lastDraggedPath = getDomPath(e.target);
      }, true);

      window.addEventListener('drop', (e) => {
        if (isLocalInteraction) return;
        const targetPath = getDomPath(e.target);
        if (lastDraggedPath && targetPath) {
          window.parent.postMessage({
            type: 'sandbox_sync',
            event: 'drag_and_drop',
            sourcePath: lastDraggedPath,
            targetPath: targetPath
          }, '*');
        }
      }, true);

      // 6. Sync Keyboard
      window.addEventListener('keydown', (e) => {
        if (isLocalInteraction) return;
        // Ignore generic typing in inputs since 'input' event covers it, but for games we need arrows/space
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
          e.preventDefault(); // commonly needed for games to stop scrolling
        }
        window.parent.postMessage({
          type: 'sandbox_sync',
          event: 'keydown',
          key: e.key,
          code: e.code
        }, '*');
      }, true);

      window.addEventListener('keyup', (e) => {
        if (isLocalInteraction) return;
        window.parent.postMessage({
          type: 'sandbox_sync',
          event: 'keyup',
          key: e.key,
          code: e.code
        }, '*');
      }, true);

      // Listen for remote events
      window.addEventListener('message', (e) => {
        if (e.data.type === 'remote_sandbox_sync') {
          isLocalInteraction = true;
          const data = e.data.payload;

          if (data.event === 'mousemove') {
            const clientX = data.x * window.innerWidth;
            const clientY = data.y * window.innerHeight;
            updateFakeCursor(clientX, clientY, data.senderName);
            
            // Dispatch synthetic event to support custom drag/canvas
            const el = document.elementFromPoint(clientX, clientY) || document.body;
            el.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, clientX, clientY }));
          } 
          else if (data.event === 'mousedown' || data.event === 'mouseup') {
            const clientX = data.x * window.innerWidth;
            const clientY = data.y * window.innerHeight;
            const el = document.elementFromPoint(clientX, clientY) || document.body;
            el.dispatchEvent(new MouseEvent(data.event, { bubbles: true, cancelable: true, clientX, clientY }));
          }
          else if (data.event === 'keydown' || data.event === 'keyup') {
            document.dispatchEvent(new KeyboardEvent(data.event, { bubbles: true, cancelable: true, key: data.key, code: data.code }));
          } 
          else if (data.event === 'click') {
            let el = null;
            try {
              if (data.path) el = document.querySelector(data.path);
            } catch (e) {}
            if (!el) {
              el = document.elementFromPoint(data.x * window.innerWidth, data.y * window.innerHeight);
            }
            if (el) {
              // Dispatch full event to handle SVG paths and complex bubbling
              const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: data.x * window.innerWidth,
                clientY: data.y * window.innerHeight
              });
              el.dispatchEvent(clickEvent);
              
              // Removed fallback el.click() because dispatchEvent is sufficient and fallback caused double-clicks on some devices.

              // Create ripple effect
              createRipple(data.x * window.innerWidth, data.y * window.innerHeight);
            }
          }
          else if (data.event === 'input') {
            let el = null;
            try {
              if (data.path) el = document.querySelector(data.path);
            } catch (e) {}
            if (el) {
              if (el.type === 'checkbox' || el.type === 'radio') {
                el.checked = data.checked;
              } else {
                el.value = data.value;
              }
              // Trigger events so React/Vue/Vanilla scripts catch the change
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
          else if (data.event === 'scroll') {
            window.scrollTo(
              data.scrollX * (document.documentElement.scrollWidth - window.innerWidth),
              data.scrollY * (document.documentElement.scrollHeight - window.innerHeight)
            );
          }
          else if (data.event === 'drag_and_drop') {
            let sourceEl = null;
            let targetEl = null;
            try {
              sourceEl = document.querySelector(data.sourcePath);
              targetEl = document.querySelector(data.targetPath);
            } catch(e) {}
            
            if (sourceEl && targetEl) {
              const dt = new DataTransfer();
              
              const dragStartEvent = new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: dt });
              sourceEl.dispatchEvent(dragStartEvent);
              
              const dropEvent = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt });
              targetEl.dispatchEvent(dropEvent);
              
              const dragEndEvent = new DragEvent('dragend', { bubbles: true, cancelable: true, dataTransfer: dt });
              sourceEl.dispatchEvent(dragEndEvent);
            }
          }
          
          setTimeout(() => { isLocalInteraction = false; }, 10);
        }
      });

      // Helper to generate CSS Path
      function getDomPath(el) {
        if (!el) return '';
        var stack = [];
        while (el.parentNode != null) {
          var sibCount = 0;
          var sibIndex = 0;
          for (var i = 0; i < el.parentNode.childNodes.length; i++) {
            var sib = el.parentNode.childNodes[i];
            if (sib.nodeName == el.nodeName) {
              if (sib === el) { sibIndex = sibCount; }
              sibCount++;
            }
          }
          if (el.hasAttribute('id') && el.id != '') {
            stack.unshift(el.nodeName.toLowerCase() + '#' + el.id);
            break; // Since ID is unique
          } else if (sibCount > 1) {
            stack.unshift(el.nodeName.toLowerCase() + ':eq(' + sibIndex + ')');
          } else {
            stack.unshift(el.nodeName.toLowerCase());
          }
          el = el.parentNode;
        }
        // convert :eq to :nth-of-type (rough approximation for querySelector)
        return stack.join(' > ').replace(/:eq\\((\\d+)\\)/g, function(match, p1) {
          return ':nth-of-type(' + (parseInt(p1) + 1) + ')';
        });
      }

      // Fake Cursor Logic
      let cursorEl = null;
      let cursorNameEl = null;
      let hideCursorTimeout = null;
      function updateFakeCursor(x, y, name) {
        if (!cursorEl) {
          cursorEl = document.createElement('div');
          cursorEl.style.position = 'fixed';
          cursorEl.style.width = '16px';
          cursorEl.style.height = '16px';
          cursorEl.style.backgroundColor = '#ef4444';
          cursorEl.style.border = '2px solid white';
          cursorEl.style.borderRadius = '50%';
          cursorEl.style.pointerEvents = 'none';
          cursorEl.style.zIndex = '999999';
          cursorEl.style.transition = 'transform 0.1s linear, opacity 0.3s';
          
          cursorNameEl = document.createElement('div');
          cursorNameEl.style.position = 'absolute';
          cursorNameEl.style.top = '20px';
          cursorNameEl.style.left = '20px';
          cursorNameEl.style.background = '#ef4444';
          cursorNameEl.style.color = 'white';
          cursorNameEl.style.padding = '2px 6px';
          cursorNameEl.style.borderRadius = '4px';
          cursorNameEl.style.fontSize = '12px';
          cursorNameEl.style.fontWeight = 'bold';
          cursorNameEl.style.whiteSpace = 'nowrap';
          cursorNameEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
          cursorEl.appendChild(cursorNameEl);
          
          document.body.appendChild(cursorEl);
        }
        
        cursorEl.style.opacity = '1';
        cursorEl.style.transform = \`translate(\${x}px, \${y}px)\`;
        if (name && cursorNameEl.innerText !== name) {
          cursorNameEl.innerText = name;
        }
        
        clearTimeout(hideCursorTimeout);
        hideCursorTimeout = setTimeout(() => {
          if (cursorEl) cursorEl.style.opacity = '0';
        }, 2000);
      }

      // Ripple Effect
      function createRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.style.position = 'fixed';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.borderRadius = '50%';
        ripple.style.border = '2px solid #ef4444';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '999998';
        ripple.style.animation = 'sandboxRipple 0.5s ease-out forwards';
        
        if (!document.getElementById('sandbox-ripple-style')) {
          const style = document.createElement('style');
          style.id = 'sandbox-ripple-style';
          style.innerHTML = \`
            @keyframes sandboxRipple {
              0% { width: 0; height: 0; opacity: 1; }
              100% { width: 50px; height: 50px; opacity: 0; }
            }
          \`;
          document.head.appendChild(style);
        }
        
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);
      }

    })();
  </script>
`;

