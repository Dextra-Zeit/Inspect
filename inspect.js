(function() {
    // Inject CSS dynamically
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes floating {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
            50% { transform: translateY(-10px) rotate(15deg); opacity: 1; }
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, -60%); }
            to { opacity: 1; transform: translate(-50%, -50%); }
        }

        /* Overlay */
        .custom-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: none;
            z-index: 999;
            overflow: hidden;
        }

        /* Modal Container */
        .custom-modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #222;
            color: #ddd;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.5);
            z-index: 1000;
            width: 400px;
            max-width: 90%;
            height: auto;
            overflow: auto;
            position: relative;
            animation: fadeIn 0.3s ease-out;
        }

        /* Input & Textarea */
        .custom-modal input, .custom-modal textarea {
            width: 100%;
            margin-bottom: 10px;
            padding: 8px;
            background-color: #333;
            color: #fff;
            border: 1px solid #555;
        }

        .custom-modal button {
            padding: 8px 15px;
            background-color: #007BFF;
            color: white;
            border: none;
            cursor: pointer;
        }

        .custom-modal button:hover {
            background-color: #0056b3;
        }

        .css-list {
            max-height: 300px;
            overflow-y: auto;
        }

        /* Parent Element Selector */
        .parent-selector {
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }

        .parent-selector select {
            width: 100%;
            padding: 5px;
            background-color: #333;
            color: #fff;
            border: 1px solid #555;
        }

        /* Sparkle Background */
        .glitter-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        }

        .glitter {
            position: absolute;
            font-size: 16px;
            opacity: 0.8;
            animation: floating 3s infinite ease-in-out;
            pointer-events: none;
            color: rgba(255, 255, 255, 0.8);
        }
    `;
    document.head.appendChild(style);

    // Create modal & overlay elements
    const overlay = document.createElement('div');
    overlay.className = 'custom-overlay';
    document.body.appendChild(overlay);

    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `
        <div class="parent-selector">
            <label for="parentSelect">Editing: </label>
            <select id="parentSelect"></select>
        </div>
        <h3 id="element-header">Edit Element: </h3>
        <div id="properties" class="css-list"></div>
        <button id="closeModal">Close</button>
    `;
    document.body.appendChild(modal);

    const parentSelect = document.getElementById('parentSelect');
    const propertiesContainer = document.getElementById('properties');
    const closeModalButton = document.getElementById('closeModal');
    const elementHeader = document.getElementById('element-header');

    let currentElement = null;
    let active = false;

    function openModal(element) {
        if (active) return;
        active = true;

        currentElement = element;
        overlay.style.display = 'block';
        modal.style.display = 'block';
        updateParentSelector();
        updateEditor();
    }

    function updateParentSelector() {
        parentSelect.innerHTML = '';
        let elem = currentElement;

        while (elem) {
            const option = document.createElement('option');
            option.value = elem.tagName.toLowerCase();
            option.innerText = `<${elem.tagName.toLowerCase()}>`;
            option.dataset.element = elem;
            parentSelect.appendChild(option);
            elem = elem.parentElement;
        }

        parentSelect.addEventListener('change', function() {
            let selectedIndex = parentSelect.selectedIndex;
            let selectedOption = parentSelect.options[selectedIndex];
            currentElement = getElementFromOption(selectedOption);
            updateEditor();
        });
    }

    function getElementFromOption(option) {
        let elements = document.getElementsByTagName(option.value);
        return elements.length ? elements[0] : currentElement;
    }

    function updateEditor() {
        propertiesContainer.innerHTML = '';

        elementHeader.innerText = `Edit Element: <${currentElement.tagName.toLowerCase()}>`;

        // Editable inner text
        const textContent = document.createElement('textarea');
        textContent.value = currentElement.textContent;
        textContent.addEventListener('input', function() {
            currentElement.textContent = textContent.value;
        });

        propertiesContainer.appendChild(document.createElement('hr'));
        propertiesContainer.appendChild(textContent);

        // List attributes for editing
        for (let attr of currentElement.attributes) {
            const attrContainer = document.createElement('div');
            attrContainer.className = 'css-item';

            const attrName = document.createElement('input');
            attrName.type = 'text';
            attrName.value = attr.name;
            attrName.style.width = '40%';
            attrName.style.marginRight = '5px';

            const attrValue = document.createElement('input');
            attrValue.type = 'text';
            attrValue.value = attr.value;
            attrValue.style.width = '55%';

            attrName.addEventListener('input', function() {
                if (attrName.value !== '') {
                    currentElement.removeAttribute(attr.name);
                    currentElement.setAttribute(attrName.value, attrValue.value);
                }
            });

            attrValue.addEventListener('input', function() {
                currentElement.setAttribute(attrName.value, attrValue.value);
            });

            attrContainer.appendChild(attrName);
            attrContainer.appendChild(attrValue);
            propertiesContainer.appendChild(attrContainer);
        }

        // Save button
        const saveButton = document.createElement('button');
        saveButton.innerText = 'Save Changes';
        saveButton.addEventListener('click', closeModalHandler);
        propertiesContainer.appendChild(saveButton);
    }

    function closeModalHandler() {
        active = false;
        overlay.style.display = 'none';
        modal.style.display = 'none';
        propertiesContainer.innerHTML = '';
    }

    document.body.addEventListener('click', function(event) {
        if (!event.target.closest('.custom-modal') && event.target !== overlay) {
            openModal(event.target);
        }
    });

    overlay.addEventListener('click', closeModalHandler);
    closeModalButton.addEventListener('click', closeModalHandler);

    function scatterGlitter(container, count, symbols) {
        let glitterContainer = document.createElement('div');
        glitterContainer.className = 'glitter-container';

        for (let i = 0; i < count; i++) {
            let sparkle = document.createElement('div');
            sparkle.className = 'glitter';
            sparkle.innerText = symbols[Math.floor(Math.random() * symbols.length)];

            let size = Math.random() * 20 + 10;
            sparkle.style.fontSize = `${size}px`;
            sparkle.style.top = `${Math.random() * 100}%`;
            sparkle.style.left = `${Math.random() * 100}%`;
            sparkle.style.animationDuration = `${Math.random() * 2 + 2}s`;

            glitterContainer.appendChild(sparkle);
        }

        container.appendChild(glitterContainer);
    }

    scatterGlitter(document.querySelector('.custom-overlay'), 40, ['✨', '⭐', '♥️']);
    scatterGlitter(document.querySelector('.custom-modal'), 20, ['✨', '⭐']);
})();
