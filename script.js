var data = JSON.parse(localStorage.getItem('items'));
var fields = data && data.length > 0 && Object.keys(data.filter(f => Object.keys(f).length === Math.max(...data.map(m => Object.keys(m).length)))[0]);

const importData = () => {
    document.querySelector("#importData").click();
}
const exportData = () => {
    var name = prompt('Salvar como:', localStorage.getItem("lastFilename"));
    if (name) {
        download(localStorage.getItem("items"),  name + '.json', 'data')
    }
}

const closeModal = () => {
    document.body.style.overflow = '';
    document.querySelector('.modal-wrapper').remove();
}

const openModal = (properties) => {
    document.body.style.overflow = 'hidden';
    const wrapper = document.createElement('div');
    wrapper.className = 'modal-wrapper';
    wrapper.onclick = closeModal;
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
    <div class="header">
    <span>${properties.header}</span><span onclick="closeModal()">&times;</span></div>
    <div>${properties.content}</div>
    <div class="footer">${properties.footer}</div>
    `;
    wrapper.appendChild(modal);
    modal.onclick = e => e.stopPropagation();
    document.body.appendChild(wrapper);
}

const addData = () => {
    openModal({
        header: 'Adicionar Objeto',
        content: `<textarea id="edited-json" rows="${fields.length + 2}" cols="40">${JSON.stringify(JSON.parse(`{${fields.map(e => `"${e}": null` )}}`), null, "\t")}</textarea>`,
        footer: `<button class="export" onclick="saveItem(event)">Confirmar</button><button onclick="closeModal()">Cancelar</button>`
    })
}

const saveItem = (event) => {
    const newValue = JSON.parse(document.querySelector("#edited-json").value);
    const items = JSON.parse(localStorage.getItem("items"));
    items.unshift(newValue)
    localStorage.setItem("items", JSON.stringify(items));
    closeModal();
    window.location.reload();
}

const importDataFile = (event) => {
    var reader = new FileReader();
    reader.onload = onReaderLoad;
    localStorage.setItem("lastFilename", event.target.files[0].name.split(".")[0]);
    reader.readAsText(event.target.files[0])
    window.location.reload();
}

function onReaderLoad(event) {
    var obj = JSON.parse(event.target.result);
    localStorage.setItem('items', JSON.stringify(obj));
}

function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob)
        window.navigator.msSaveOrOpenBlob(file, filename);
    else {
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

const elementFactory = (tagName, properties, classList, children) => {
    const newElement = document.createElement(tagName);
    if (properties) Object.keys(properties).forEach(property => {
        newElement[property] = properties[property];
    });
    if (classList) classList.forEach((classItem) => classItem && newElement.classList.add(classItem));
    if (children) children.forEach((child) => newElement.appendChild(child));
    return newElement;
}

if (data && data.length > 0) {
    Array.from(document.querySelectorAll('.controls-add')).forEach(e => e.style.display = '');
    if (!localStorage.getItem('items')) {

        localStorage.setItem('items', JSON.stringify(data));
    }

    const change = (item) => {
        Array.from(item.target.parentNode.parentNode.children).forEach((element, index) => {
            if (element.tagName === 'TD') {
                const input = document.createElement('input');
                input.name = element.className;
                input.value = element.innerHTML;
                element.innerHTML = null;
                element.appendChild(input);
            }
            if (element.tagName === 'DIV') {
                element.innerHTML = null;
                const buttonSave = document.createElement('button');
                buttonSave.innerText = 'Salvar';
                buttonSave.onclick = save;
                buttonSave.id = index;
                element.appendChild(buttonSave);
            }
        })
    }
    const save = (item) => {
        var obj = {};
        Array.from(item.target.parentNode.parentNode.querySelectorAll('input')).forEach(it => {
            obj[it.name] = it.value;
        })
        var newItems = JSON.parse(localStorage.getItem('items'));
        newItems[item.target.parentNode.parentNode.id] = obj;
        localStorage.setItem('items', JSON.stringify(newItems));
        location.reload();
    }

    const remove = (item) => {
        var newItems = JSON.parse(localStorage.getItem('items'));
        localStorage.setItem('items', JSON.stringify(newItems.filter((e, index) => index != item.target.parentNode.parentNode.id)))
        location.reload()
    }

    Array.from(JSON.parse(localStorage.getItem('items'))).forEach((item, index) => {
        const buttonEdit = elementFactory('button', { innerText: 'Editar', onclick: change });
        const buttonDelete = elementFactory('button', { innerText: 'Deletar', onclick: remove }, ['delete']);
        const actionWrapper = elementFactory('div', null, ['action'], [buttonEdit, buttonDelete]);
        const row = elementFactory('tr', { id: index }, null, [...fields.map((field) => {
            return elementFactory('td', { innerHTML: item[field] || 'N/A' }, [field]);
        }), actionWrapper]);
        document.querySelector('tbody').appendChild(row);
    });

    fields.map((field) => {
        document.querySelector('thead').appendChild(elementFactory('td', { innerHTML: field }));
    })
    document.querySelector('thead').appendChild(elementFactory('td', { innerHTML: 'Ações' }, ['center']));

} else {
    Array.from(document.querySelectorAll('.controls-add')).forEach(e => e.style.display = 'none');
    document.body.append(elementFactory('article', {innerText: "Exporte um documento válido para iniciar"}, ['alert']))
}