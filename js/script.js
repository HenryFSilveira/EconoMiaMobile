// ==========================================================================
// VARIÁVEIS GLOBAIS E CONSTANTES
// ==========================================================================
let valorInvestimentoOriginal = 0;
let cartoesModal = [];
let despesasFixasModal = [];
let draggedItem = null;
let draggedFixaItem = null;

const PREDEFINED_INSTITUTIONS = [
    { id: 'alimentacao', name: 'VR/VA Alimentação', logo: 'imgs/alimentacao.png' },
    { id: 'nubank', name: 'Nubank', logo: 'imgs/nubanklogo.png' },
    { id: 'inter', name: 'Inter', logo: 'imgs/interlogo.png' },
    { id: 'itaú', name: 'Itaú', logo: 'imgs/itaulogo.png' },
    { id: 'bb', name: 'Banco do Brasil', logo: 'imgs/bblogo.png' },
    { id: 'santander', name: 'Santander', logo: 'imgs/santanderlogo.png' },
    { id: 'bradesco', name: 'Bradesco', logo: 'imgs/bradescologo.jpeg' },
    { id: 'c6', name: 'C6 Bank', logo: 'imgs/c6logo.jpg' },
    { id: 'caixa_federal', name: 'Caixa', logo: 'imgs/caixalogo.jpeg' },
    { id: 'sicredi', name: 'Sicredi', logo: 'imgs/sicredilogo.webp' },
    { id: 'banrisul', name: 'Banrisul', logo: 'imgs/banrisullogo.png' },
    { id: 'renner', name: 'Renner', logo: 'imgs/rennerlogo.png' },
];

const PREDEFINED_CATEGORIES = [
    "🥪 Alimentação", "😎 Lazer", "🧾 Contas", "🛒 Compras Online", "📚 Estudos",
    "⛽️ Transporte", "🐱 Pets", "🏠 Casa", "📺 Assinaturas", "🧥 Vestuário", "🎁 Outros"
];
const CATEGORIA_ALIMENTACAO_CARTAO_NOME = "🥪 Alimentação";

const PREDEFINED_FIXED_EXPENSES = [
    { id: 'agua', name: 'Água', logo: 'imgs/icones fixas/agua.png' },
    { id: 'luz', name: 'Luz', logo: 'imgs/icones fixas/luz.png' },
    { id: 'internet', name: 'Internet', logo: 'imgs/icones fixas/internet.png' },
    { id: 'casa', name: 'Casa/Aluguel', logo: 'imgs/icones fixas/casa.png' },
    { id: 'academia', name: 'Academia', logo: 'imgs/icones fixas/academia.png' },
    { id: 'assinatura', name: 'Assinatura', logo: 'imgs/icones fixas/assinatura.png' },
    { id: 'transporte', name: 'Transporte', logo: 'imgs/icones fixas/transporte.png' },
];
const OUTROS_OPTION_ID = 'outros_fixa';
const DEFAULT_OUTROS_FIXA_LOGO = 'imgs/icones fixas/outros.png';
const FIXED_EXPENSES_NO_DUE_DATE_IDS = ['transporte'];
const CARD_INSTITUTION_NO_DUE_DATE_ID = 'alimentacao';
const TEXTO_NAO_DEFINIDO = 'Não definido';
const VALOR_SELECT_SEM_VENCIMENTO = 'nao_definido_venc_val';

const meses = {
    "01": "Janeiro", "02": "Fevereiro", "03": "Março", "04": "Abril", "05": "Maio", "06": "Junho",
    "07": "Julho", "08": "Agosto", "09": "Setembro", "10": "Outubro", "11": "Novembro", "12": "Dezembro"
};

// Função auxiliar para formatar o dia com zero à esquerda
function formatarDiaComZero(dia) {
    if (!dia) return ''; // Retorna vazio se não houver dia
    const diaNum = parseInt(dia, 10);
    if (isNaN(diaNum)) return ''; // Retorna vazio se não for número
    if (diaNum < 10 && String(dia).length === 1) {
        return '0' + diaNum;
    }
    return String(dia); // Retorna como string
}


// ==========================================================================
// FUNÇÕES DE FORMATAÇÃO E UTILIDADES
// ==========================================================================
function formatarInput(input) {
    const prefixo = "R$ ";
    let valor = input.value.replace(/\D/g, "");
    if (valor === "") { input.value = prefixo + "0,00"; if (document.activeElement === input) { input.setSelectionRange(input.value.length, input.value.length); } return; }
    valor = (parseInt(valor, 10) / 100).toFixed(2);
    valor = valor.replace(".", ",");
    valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    input.value = prefixo + valor;
    if (document.activeElement === input) {
        input.setSelectionRange(input.value.length, input.value.length);
    }
}
function paraNumero(valor) {
    if (!valor) return 0;
    const apenasNumero = valor.replace(/[^0-9,.-]/g, '');
    const numero = parseFloat(apenasNumero.replace(/\./g, '').replace(',', '.'));
    return isNaN(numero) ? 0 : numero;
}
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}
function formatarPercentual(input) {
    let val = input.value.replace("%", "").trim();
    if (val === "") { input.value = ""; return; }
    val = val.replace(",", ".").replace(/[^0-9.]/g, "");
    if (val.includes(".")) { const partes = val.split("."); val = partes[0] + "." + partes[1].slice(0, 2); }
    let num = parseFloat(val);
    if (isNaN(num) || num < 0) num = 0;
    if (num > 100) num = 100;
    input.value = num.toString().replace(".", ",") + "%";
    if (document.activeElement === input) {
        input.setSelectionRange(input.value.length - 1, input.value.length - 1);
    }
}

function atualizarCoresDosValores(gastarLivre, sobra) {
    const gastarLivreEl = document.getElementById("gastarLivre");
    const valorGastarLivreEl = document.getElementById("valorGastarLivre");
    const sobraContainer = document.getElementById("sobraContainer");
    const sobraEl = document.getElementById("sobraValor");

    if (gastarLivreEl) gastarLivreEl.classList.remove("destaque-verde", "destaque-vermelho");
    if (valorGastarLivreEl) valorGastarLivreEl.classList.remove("valor-verde", "valor-vermelho");

    if (sobraContainer) sobraContainer.classList.remove("destaque-vermelho", "destaque-verde");
    if (sobraEl) sobraEl.classList.remove("valor-vermelho", "valor-verde");

    if (gastarLivre > 0) {
        if (gastarLivreEl) gastarLivreEl.classList.add("destaque-verde");
        if (valorGastarLivreEl) {
            valorGastarLivreEl.classList.add("valor-verde");
        }
    }

    if (sobra <= 0) {
        if (sobraContainer) sobraContainer.classList.add("destaque-vermelho");
        if (sobraEl) sobraEl.classList.add("valor-vermelho");
    } else {
        if (sobraEl) sobraEl.classList.add("valor-verde");
    }
}

// ==========================================================================
// LÓGICA DE CÁLCULO PRINCIPAL
// ==========================================================================
function calcular() {
    const renda = paraNumero(document.getElementById("renda").value);

    if (renda <= 0) {
        const tabelaFixasRowsCheck = document.querySelectorAll("#tabelaFixas tbody tr");
        let temFixas = false;
        tabelaFixasRowsCheck.forEach(row => {
            const inputValor = row.querySelector("td[data-label='Valor (R$)'] input[type='text']");
            if (inputValor && paraNumero(inputValor.value) > 0) temFixas = true;
        });
        const tabelaCartoesRowsCheck = document.querySelectorAll("#tabelaCartoes tbody tr");
        let temCartoes = false;
        tabelaCartoesRowsCheck.forEach(row => {
            const inputValor = row.querySelector("td[data-label='Valor (R$)'] input[type='text']");
            if (inputValor && paraNumero(inputValor.value) > 0) temCartoes = true;
        });

        if (!temFixas && !temCartoes) {
            Swal.fire({
                icon: 'warning',
                title: 'Atenção! ',
                html: '<div style="text-align: center;">Defina a Renda Mensal ou adicione<br>pelo menos uma despesa para calcular.</div>',
                customClass: { popup: 'swal2-dark' }
            });
            return;
        }
    }

    const tabelaFixasRows = document.querySelectorAll("#tabelaFixas tbody tr");
    let totalFixas = 0;
    tabelaFixasRows.forEach(row => {
        const inputValor = row.querySelector("td[data-label='Valor (R$)'] input[type='text']");
        if (inputValor) totalFixas += paraNumero(inputValor.value);
    });

    const tabelaCartoesRows = document.querySelectorAll("#tabelaCartoes tbody tr");
    let totalCartoes = 0;
    tabelaCartoesRows.forEach(row => {
        const inputValor = row.querySelector("td[data-label='Valor (R$)'] input[type='text']");
        if (inputValor) totalCartoes += paraNumero(inputValor.value);
    });

    const totalGastos = totalFixas + totalCartoes;
    const sobra = renda - totalGastos;
    const investir = sobra > 0 ? sobra * 0.6 : 0;
    const gastarLivre = sobra > 0 ? sobra * 0.4 : 0;
    valorInvestimentoOriginal = investir;

    document.getElementById("rendaValor").textContent = formatarMoeda(renda);
    document.getElementById("totalFixasValor").textContent = formatarMoeda(totalFixas);
    document.getElementById("totalCartoesValor").textContent = formatarMoeda(totalCartoes);
    document.getElementById("totalGastosValor").textContent = formatarMoeda(totalGastos);
    document.getElementById("sobraValor").textContent = formatarMoeda(sobra);
    document.getElementById("valorGastarLivre").textContent = formatarMoeda(gastarLivre);
    document.getElementById("valorInvestir").textContent = formatarMoeda(investir);

    atualizarCoresDosValores(gastarLivre, sobra);

    document.getElementById("secaoResumo").style.display = 'block';
    document.getElementById("secaoInvestir").style.display = 'block';

    atualizarInvestimentos();

    const secaoResumoDiv = document.getElementById('secaoResumo');
    if (secaoResumoDiv) {
        const resumoHeader = secaoResumoDiv.querySelector('.secao-header');
        const resumoContentWrapper = resumoHeader ? resumoHeader.nextElementSibling : null;
        if (resumoHeader && resumoContentWrapper && resumoContentWrapper.classList.contains('accordion-content')) {
            if (!resumoContentWrapper.classList.contains('conteudo-ativo')) {
                resumoHeader.classList.add('active');
                resumoContentWrapper.classList.add('conteudo-ativo');
            }
            requestAnimationFrame(() => {
                resumoContentWrapper.style.maxHeight = resumoContentWrapper.scrollHeight + "px";
            });
        }
    }

    const secaoInvestirDiv = document.getElementById('secaoInvestir');
    if (secaoInvestirDiv) {
        const investirHeader = secaoInvestirDiv.querySelector('.secao-header');
        const investirContentWrapper = investirHeader ? investirHeader.nextElementSibling : null;
        if (investirHeader && investirContentWrapper && investirContentWrapper.classList.contains('accordion-content')) {
            if (!investirContentWrapper.classList.contains('conteudo-ativo')) {
                investirHeader.classList.add('active');
                investirContentWrapper.classList.add('conteudo-ativo');
            }
            requestAnimationFrame(() => {
                investirContentWrapper.style.maxHeight = investirContentWrapper.scrollHeight + "px";
            });
        }
    }
    salvarDados();
    initAccordions();
}

// ==========================================================================
// GERENCIAMENTO DE INVESTIMENTOS
// ==========================================================================
function adicionarInvestimento() {
    const tabelaBody = document.getElementById("tabelaInvestimentos").getElementsByTagName('tbody')[0];
    const template = document.getElementById("linhaInvestimentoTemplate");
    if (!template) { console.error("Template de linha de investimento não encontrado!"); return; }
    const novaLinha = template.querySelector("tr").cloneNode(true);

    tabelaBody.appendChild(novaLinha);
    addInputListenersToElement(novaLinha);
    salvarDados();
}

function removerInvestimento(botao) {
    Swal.fire({ title: 'Remover este investimento?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sim, remover', cancelButtonText: 'Cancelar', showCloseButton: true, customClass: { popup: 'swal2-dark' }, focusConfirm: false, allowOutsideClick: false })
        .then((result) => {
            if (result.isConfirmed) {
                botao.closest("tr").remove();
                atualizarInvestimentos();
                salvarDados();
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Investimento removido', showConfirmButton: false, timer: 1500, customClass: { popup: 'swal2-dark' } });
            }
        });
}

function atualizarInvestimentos() {
    const valorInvestirTotal = valorInvestimentoOriginal;
    const tbody = document.getElementById("tabelaInvestimentos").getElementsByTagName('tbody')[0];
    const linhas = tbody.querySelectorAll("tr");
    let somaPercentual = 0;
    linhas.forEach(linha => {
        const inputPerc = linha.querySelector("td[data-label='%'] input");
        let percStr = inputPerc ? inputPerc.value.replace(",", ".") : "0";
        let perc = parseFloat(percStr) || 0;
        somaPercentual += perc;
    });
    if (somaPercentual > 100) {
        if (linhas.length > 0) {
            const ultimaLinha = linhas[linhas.length - 1];
            const inputUltimo = ultimaLinha.querySelector("td[data-label='%'] input");
            let ultimaPercStr = inputUltimo.value.replace(",", ".");
            let ultimaPerc = parseFloat(ultimaPercStr) || 0;
            const excesso = somaPercentual - 100;
            let novaUltimaPerc = ultimaPerc - excesso;
            if (novaUltimaPerc < 0) novaUltimaPerc = 0;
            inputUltimo.value = novaUltimaPerc.toFixed(2).replace(".", ",") + "%";
            formatarPercentual(inputUltimo);
            somaPercentual = 100;
            Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Percentual ajustado para 100%', showConfirmButton: false, timer: 2500, customClass: { popup: 'swal2-dark' } });
        } else {
            Swal.fire({ icon: 'error', title: 'Erro!', text: 'O total das porcentagens não pode ultrapassar 100%.', customClass: { popup: 'swal2-dark' } });
        }
    }
    let somaValoresInvestidos = 0;
    linhas.forEach(linha => {
        const inputPerc = linha.querySelector("td[data-label='%'] input");
        let percStr = inputPerc ? inputPerc.value.replace(",", ".") : "0";
        let perc = parseFloat(percStr) || 0;
        let valorLinha = (perc / 100) * valorInvestirTotal;
        linha.querySelector("td[data-label='Valor']").innerHTML = `<span class="valor-amarelo">${formatarMoeda(valorLinha)}</span>`;
        somaValoresInvestidos += valorLinha;
    });
    const saldoDisponivelParaInvestir = valorInvestirTotal - somaValoresInvestidos;
    document.getElementById("valorInvestir").textContent = formatarMoeda(saldoDisponivelParaInvestir >= 0 ? saldoDisponivelParaInvestir : 0);
}

// ==========================================================================
// FUNÇÃO AUXILIAR PARA EXTRAIR NOME DA DESPESA/INSTITUIÇÃO
// ==========================================================================
function getActualExpenseNameFromCell(nameCell) {
    if (!nameCell) return TEXTO_NAO_DEFINIDO;
    const nameSpan = nameCell.querySelector('span.expense-name');
    if (nameSpan && nameSpan.textContent.trim() !== '') {
        return nameSpan.textContent.trim();
    }
    let textContent = "";
    let foundImage = false;
    for (const child of nameCell.childNodes) {
        if (child.nodeName.toUpperCase() === 'IMG') {
            foundImage = true;
            continue;
        }
        if (foundImage && child.nodeType === Node.TEXT_NODE && child.textContent.trim() !== '') {
            textContent = child.textContent.trim();
            break;
        }
        if (!foundImage && child.nodeType === Node.TEXT_NODE && child.textContent.trim() !== '') {
            textContent = child.textContent.trim();
        }
    }
    if (!textContent.trim() && !foundImage) {
        textContent = nameCell.textContent.trim();
    }
    return textContent.trim() || TEXTO_NAO_DEFINIDO;
}

// ==========================================================================
// GERENCIAMENTO DE DESPESAS FIXAS (MODAL)
// ==========================================================================
function abrirModalFixas() {
    despesasFixasModal = [];
    const tabelaFixas = document.getElementById("tabelaFixas");
    if (!tabelaFixas) return;
    const tabelaBody = tabelaFixas.getElementsByTagName('tbody')[0];
    if (!tabelaBody) return;

    for (let i = 0; i < tabelaBody.rows.length; i++) {
        const row = tabelaBody.rows[i];
        const originalId = row.dataset.originalId;
        const nameCell = row.querySelector("td[data-label='Conta']");
        const dueDateCell = row.querySelector("td[data-label='Data de vencimento']");
        const valueInput = row.querySelector("td[data-label='Valor (R$)'] input[type='text']");

        const logoImg = nameCell ? nameCell.querySelector("img.logo-banco") : null;
        let expenseName = getActualExpenseNameFromCell(nameCell);

        let dueDateModal = '';
        const dueDateTextoTabela = dueDateCell ? dueDateCell.textContent.trim() : '';
        if (dueDateTextoTabela !== TEXTO_NAO_DEFINIDO && dueDateTextoTabela.startsWith("Dia ")) {
            dueDateModal = dueDateTextoTabela.replace("Dia ", "").trim();
            dueDateModal = formatarDiaComZero(dueDateModal); // MODIFICADO: Formata o dia
        } else if (dueDateTextoTabela === TEXTO_NAO_DEFINIDO) {
            dueDateModal = '';
        }

        despesasFixasModal.push({
            id: `fixa_modal_${Date.now()}_${i}`,
            originalId: originalId || `custom_${(expenseName || '').replace(/\s+/g, '_')}`,
            name: expenseName,
            logo: logoImg ? logoImg.src : '',
            dueDate: dueDateModal, value: valueInput ? valueInput.value : 'R$ 0,00'
        });
    }
    renderizarListaFixasModal();
    document.getElementById("modalFixas").style.display = 'flex';
}
function fecharModalFixas() {
    document.getElementById("modalFixas").style.display = 'none';
}
function renderizarListaFixasModal() {
    const lista = document.getElementById("listaFixasModal");
    lista.innerHTML = '';
    despesasFixasModal.forEach(fixa => {
        const li = document.createElement("li");
        li.setAttribute("data-id", fixa.id);
        li.setAttribute("draggable", true);
        const logoHtml = fixa.logo ? `<img src="${fixa.logo}" alt="${fixa.name}" class="logo-banco">` : '<span class="logo-banco-placeholder"></span>';
        let dueDateDisplay = '';
        const isNoDueDateExpense = FIXED_EXPENSES_NO_DUE_DATE_IDS.includes(fixa.originalId);
        // MODIFICADO: Usa o fixa.dueDate já formatado
        if (!isNoDueDateExpense && fixa.dueDate && fixa.dueDate.trim() !== '') {
            dueDateDisplay = `Dia ${fixa.dueDate}`;
        } else if (isNoDueDateExpense || !fixa.dueDate || fixa.dueDate.trim() === '') {
            dueDateDisplay = `<span class="texto-opaco">${TEXTO_NAO_DEFINIDO}</span>`;
        }
        li.innerHTML = `
            <div class="fixa-info">
                ${logoHtml}
                <div class="fixa-details">
                    <strong>${fixa.name}</strong>
                    ${dueDateDisplay ? `<span>Vencimento: ${dueDateDisplay}</span>` : ''}
                </div>
            </div>
            <div class="fixa-actions">
                <button class="btn-modal-action btn-modal-edit html2canvas-ignore" onclick="editarFixaModal('${fixa.id}')" title="Editar">✏️</button>
                <button class="btn-modal-action btn-modal-remove html2canvas-ignore" onclick="excluirFixaModal('${fixa.id}')" title="Remover"></button>
            </div>`;
        lista.appendChild(li);
    });
    addFixasDragDropListeners();
}
async function abrirFormularioAdicionarFixa() {
    const fixaOptions = PREDEFINED_FIXED_EXPENSES.map(fixa => `<option value="${fixa.id}">${fixa.name}</option>`).join('') +
        `<option value="${OUTROS_OPTION_ID}">✍️ Outros...</option>`;
    let dayOptionsHtml = `<option value="${VALOR_SELECT_SEM_VENCIMENTO}">${TEXTO_NAO_DEFINIDO}</option>`;
    for (let i = 1; i <= 31; i++) { dayOptionsHtml += `<option value="${i}">${i}</option>`; }
    const { value: formValues, isConfirmed } = await Swal.fire({
        title: 'Adicionar Nova Despesa Fixa',
        html: `
            <div style="text-align: left; margin-bottom: 1rem;"><label for="swal-fixa-select" style="display: block; margin-bottom: .3rem; font-weight: bold;">Tipo de Despesa:</label><select id="swal-fixa-select" class="swal2-select" style="width: 100%;"><option value=""></option>${fixaOptions}</select></div>
            <div id="swal-fixa-custom-container" style="text-align: left; margin-bottom: 1rem; display: none;"><label for="swal-fixa-custom" style="display: block; margin-bottom: .3rem; font-weight: bold;">Nome Personalizado:</label><input id="swal-fixa-custom" class="swal2-input" placeholder="Digite o nome da despesa"></div>
            <div id="swal-fixa-due-date-container" style="text-align: left; margin-bottom: 1rem; display: block;"><label for="swal-fixa-due-date" style="display: block; margin-bottom: .3rem; font-weight: bold;">Dia do Vencimento:</label><select id="swal-fixa-due-date" class="swal2-select" style="width: 100%;"><option value=""></option>${dayOptionsHtml}</select></div>`,
        focusConfirm: false, showCancelButton: true, confirmButtonText: 'Adicionar', cancelButtonText: 'Cancelar', customClass: { popup: 'swal2-dark' },
        didOpen: () => {
            const swalPopup = Swal.getPopup(); const fixaSelect = $('#swal-fixa-select');
            const customContainer = document.getElementById('swal-fixa-custom-container'); const customInput = document.getElementById('swal-fixa-custom');
            const dueDateContainer = document.getElementById('swal-fixa-due-date-container');
            fixaSelect.select2({ placeholder: "-- Selecione a Despesa --", allowClear: true, theme: "bootstrap-5", dropdownParent: swalPopup })
                .on('change', function () {
                    const selectedId = $(this).val(); const showCustom = (selectedId === OUTROS_OPTION_ID);
                    customContainer.style.display = showCustom ? 'block' : 'none';
                    if (showCustom) { setTimeout(() => customInput.focus(), 100); } else { customInput.value = ''; }
                    const noDueDate = FIXED_EXPENSES_NO_DUE_DATE_IDS.includes(selectedId);
                    dueDateContainer.style.display = noDueDate ? 'none' : 'block';
                    if (noDueDate) { $('#swal-fixa-due-date').val(VALOR_SELECT_SEM_VENCIMENTO).trigger('change.select2'); }
                });
            $('#swal-fixa-due-date').select2({ placeholder: "-- Dia --", allowClear: true, theme: "bootstrap-5", dropdownParent: swalPopup });
            const initialSelectedFixaId = fixaSelect.val();
            if (!initialSelectedFixaId) { dueDateContainer.style.display = 'block'; }
            else { dueDateContainer.style.display = FIXED_EXPENSES_NO_DUE_DATE_IDS.includes(initialSelectedFixaId) ? 'none' : 'block'; }
        },
        preConfirm: () => {
            const selectedId = $('#swal-fixa-select').val(); const customName = document.getElementById('swal-fixa-custom').value.trim();
            let dueDateValue = $('#swal-fixa-due-date').val();
            let dueDate = '';
            let finalName = '', finalLogo = '', finalOriginalId = selectedId;
            if (!selectedId) { Swal.showValidationMessage('Selecione um tipo de despesa.'); return false; }
            const isNoDueDateType = FIXED_EXPENSES_NO_DUE_DATE_IDS.includes(selectedId);
            const dueDateContainerIsVisible = document.getElementById('swal-fixa-due-date-container').style.display !== 'none';

            if (!isNoDueDateType && dueDateContainerIsVisible) {
                if (dueDateValue === VALOR_SELECT_SEM_VENCIMENTO || !dueDateValue) {
                    dueDate = ''; // Não definido
                } else if (dueDateValue && dueDateValue.trim() !== '') {
                    dueDate = formatarDiaComZero(dueDateValue.trim()); // MODIFICADO: Formata o dia
                } else {
                    Swal.showValidationMessage('Selecione um dia de vencimento ou "Não definido".'); return false;
                }
            } else {
                dueDate = '';
            }

            if (selectedId === OUTROS_OPTION_ID) {
                if (!customName) { Swal.showValidationMessage('Digite o nome da despesa personalizada.'); return false; }
                finalName = customName;
                finalLogo = DEFAULT_OUTROS_FIXA_LOGO;
                finalOriginalId = `custom_${customName.replace(/\s+/g, '_')}`;
            } else {
                const predefined = PREDEFINED_FIXED_EXPENSES.find(f => f.id === selectedId);
                if (predefined) { finalName = predefined.name; finalLogo = predefined.logo; }
                else { Swal.showValidationMessage('Tipo de despesa inválido.'); return false; }
            }
            return { name: finalName, logo: finalLogo, dueDate: dueDate, originalId: finalOriginalId };
        }
    });
    if (isConfirmed && formValues) { despesasFixasModal.push({ id: `fixa_modal_${Date.now()}`, ...formValues, value: 'R$ 0,00' }); renderizarListaFixasModal(); Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Despesa adicionada!', showConfirmButton: false, timer: 1500, customClass: { popup: 'swal2-dark' } }); }
}
async function editarFixaModal(id) {
    const fixaIndex = despesasFixasModal.findIndex(f => f.id === id);
    if (fixaIndex === -1) return;
    const fixa = despesasFixasModal[fixaIndex];

    const isPredefinedNonEditable = PREDEFINED_FIXED_EXPENSES.some(p => p.id === fixa.originalId);

    let nameInputHtml;
    if (isPredefinedNonEditable) {
        nameInputHtml = `
            <div style="text-align: left; margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: .3rem; font-weight: bold;">Nome da Despesa:</label>
                <input class="swal2-input" value="${fixa.name}" readonly style="background-color: #383838; cursor: not-allowed; color: #ccc;">
            </div>`;
    } else {
        const displayNameForInput = (fixa.name === TEXTO_NAO_DEFINIDO || !fixa.name) ? '' : fixa.name;
        const placeholderForInput = TEXTO_NAO_DEFINIDO;
        nameInputHtml = `
            <div style="text-align: left; margin-bottom: 1rem;">
                <label for="swal-fixa-edit-custom-name" style="display: block; margin-bottom: .3rem; font-weight: bold;">Nome da Despesa Personalizada:</label>
                <input id="swal-fixa-edit-custom-name" class="swal2-input" value="${displayNameForInput}" placeholder="${placeholderForInput}">
            </div>`;
    }

    let dayOptionsHtml = `<option value="${VALOR_SELECT_SEM_VENCIMENTO}">${TEXTO_NAO_DEFINIDO}</option>`;
    for (let i = 1; i <= 31; i++) {
        dayOptionsHtml += `<option value="${i}">${i}</option>`;
    }
    const dueDateContainerVisible = !FIXED_EXPENSES_NO_DUE_DATE_IDS.includes(fixa.originalId);

    const { value: formValues } = await Swal.fire({
        title: 'Editar Despesa Fixa',
        html: nameInputHtml +
            `<div id="swal-fixa-edit-due-date-container" style="text-align: left; margin-bottom: 1rem; display: ${dueDateContainerVisible ? 'block' : 'none'};">
                <label for="swal-fixa-edit-due-date" style="display: block; margin-bottom: .3rem; font-weight: bold;">Dia do Vencimento:</label>
                <select id="swal-fixa-edit-due-date" class="swal2-select" style="width: 100%;"><option value=""></option>${dayOptionsHtml}</select>
            </div>`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Salvar',
        cancelButtonText: 'Cancelar',
        customClass: { popup: 'swal2-dark' },
        didOpen: () => {
            const swalPopup = Swal.getPopup();
            const dueDateSelect = $('#swal-fixa-edit-due-date');
            dueDateSelect.select2({ placeholder: "-- Dia --", allowClear: true, theme: "bootstrap-5", dropdownParent: swalPopup });
            // MODIFICADO: Usa o valor já formatado (se existir) ou o VALOR_SELECT_SEM_VENCIMENTO
            dueDateSelect.val(fixa.dueDate || VALOR_SELECT_SEM_VENCIMENTO).trigger('change.select2');

            if (!isPredefinedNonEditable) {
                const customNameInput = document.getElementById('swal-fixa-edit-custom-name');
                if (customNameInput) {
                    customNameInput.focus();
                }
            }
        },
        preConfirm: () => {
            let newName = fixa.name;
            if (!isPredefinedNonEditable) {
                const customNameInput = document.getElementById('swal-fixa-edit-custom-name');
                if (customNameInput) {
                    newName = customNameInput.value.trim();
                    if (newName === '') {
                        Swal.showValidationMessage('O nome da despesa personalizada não pode ser vazio.');
                        return false;
                    }
                }
            }

            let dueDateValue = $('#swal-fixa-edit-due-date').val();
            let finalDueDate = '';
            const isNoDueDateType = FIXED_EXPENSES_NO_DUE_DATE_IDS.includes(fixa.originalId);
            const dueDateContainerIsActuallyVisible = document.getElementById('swal-fixa-edit-due-date-container').style.display !== 'none';

            if (!isNoDueDateType && dueDateContainerIsActuallyVisible) {
                if (dueDateValue === VALOR_SELECT_SEM_VENCIMENTO || !dueDateValue) {
                     finalDueDate = ''; // Não definido
                } else if (dueDateValue && dueDateValue.trim() !== '') {
                    finalDueDate = formatarDiaComZero(dueDateValue.trim()); // MODIFICADO: Formata o dia
                } else {
                     Swal.showValidationMessage('Selecione um dia de vencimento ou "Não definido".'); return false;
                }
            } else {
                finalDueDate = '';
            }
            return { name: newName, dueDate: finalDueDate, logo: fixa.logo, originalId: fixa.originalId, value: fixa.value };
        }
    });
    if (formValues) {
        despesasFixasModal[fixaIndex].name = formValues.name;
        despesasFixasModal[fixaIndex].dueDate = formValues.dueDate;
        renderizarListaFixasModal();
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Despesa atualizada!', showConfirmButton: false, timer: 1500, customClass: { popup: 'swal2-dark' } });
    }
}
function excluirFixaModal(id) {
    Swal.fire({ title: 'Tem certeza?', text: "Esta despesa será removida!", icon: 'warning', showCancelButton: true, confirmButtonText: 'Sim, remover!', cancelButtonText: 'Cancelar', customClass: { popup: 'swal2-dark' } }).then((result) => { if (result.isConfirmed) { despesasFixasModal = despesasFixasModal.filter(f => f.id !== id); renderizarListaFixasModal(); Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Despesa removida!', showConfirmButton: false, timer: 1500, customClass: { popup: 'swal2-dark' } }); } });
}
function salvarModalFixas() {
    const tabelaBody = document.getElementById("tabelaFixas").getElementsByTagName('tbody')[0];
    tabelaBody.innerHTML = '';
    despesasFixasModal.forEach(fixa => {
        const newRow = tabelaBody.insertRow();
        newRow.dataset.originalId = fixa.originalId;

        const cellName = newRow.insertCell();
        cellName.setAttribute('data-label', 'Conta');
        const logoHtml = fixa.logo ? `<img src="${fixa.logo}" alt="${fixa.name}" class="logo-banco" /> ` : '';
        cellName.innerHTML = `${logoHtml}<span class="expense-name">${fixa.name}</span>`;

        const cellDueDate = newRow.insertCell();
        cellDueDate.setAttribute('data-label', 'Data de vencimento');
        cellDueDate.style.textAlign = 'center';
        const isNoDueDateExpense = FIXED_EXPENSES_NO_DUE_DATE_IDS.includes(fixa.originalId);
        // MODIFICADO: Usa o fixa.dueDate já formatado
        if (isNoDueDateExpense || !fixa.dueDate) {
            cellDueDate.textContent = TEXTO_NAO_DEFINIDO;
            cellDueDate.classList.add('texto-opaco');
        } else {
            cellDueDate.textContent = `Dia ${fixa.dueDate}`;
            cellDueDate.classList.remove('texto-opaco');
        }

        const cellValue = newRow.insertCell();
        cellValue.setAttribute('data-label', 'Valor (R$)');
        const inputValor = document.createElement('input');
        inputValor.type = 'text';
        inputValor.value = fixa.value;
        inputValor.oninput = () => formatarInput(inputValor);
        formatarInput(inputValor);
        addInputListenersToElement(inputValor);
        cellValue.appendChild(inputValor);
    });
    fecharModalFixas();
    salvarDados();
}
function addFixasDragDropListeners() {
    const items = document.querySelectorAll("#listaFixasModal li"); items.forEach(item => { item.addEventListener('dragstart', handleFixaDragStart); item.addEventListener('dragover', handleFixaDragOver); item.addEventListener('drop', handleFixaDrop); item.addEventListener('dragend', handleFixaDragEnd); });
}
function handleFixaDragStart(e) {
    draggedFixaItem = this; this.classList.add('dragging'); if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/html', this.innerHTML); }
}
function handleFixaDragOver(e) {
    e.preventDefault(); if (e.dataTransfer) { e.dataTransfer.dropEffect = 'move'; }
}
function handleFixaDrop(e) {
    e.preventDefault(); const targetItem = e.target.closest('li');
    if (targetItem && targetItem !== draggedFixaItem) {
        const draggedId = draggedFixaItem.getAttribute('data-id'); const targetId = targetItem.getAttribute('data-id');
        const draggedIndex = despesasFixasModal.findIndex(c => c.id === draggedId); const targetIndex = despesasFixasModal.findIndex(c => c.id === targetId);
        if (draggedIndex !== -1 && targetIndex !== -1) { const [movedItem] = despesasFixasModal.splice(draggedIndex, 1); despesasFixasModal.splice(targetIndex, 0, movedItem); renderizarListaFixasModal(); }
    }
}
function handleFixaDragEnd() {
    this.classList.remove('dragging'); draggedFixaItem = null;
}

// ==========================================================================
// GERENCIAMENTO DE CARTÕES (MODAL)
// ==========================================================================
function abrirModalCartoes() {
    cartoesModal = [];
    const tabelaCartoes = document.getElementById("tabelaCartoes");
    if (!tabelaCartoes) return;
    const tabelaBody = tabelaCartoes.getElementsByTagName('tbody')[0];
    if (!tabelaBody) return;

    for (let i = 0; i < tabelaBody.rows.length; i++) {
        const row = tabelaBody.rows[i];
        const institutionCell = row.querySelector("td[data-label='Instituição']");
        let customNameText = row.querySelector("td[data-label='Cartão'] span.expense-name")?.textContent.trim() ||
            row.querySelector("td[data-label='Cartão']")?.textContent.trim() || TEXTO_NAO_DEFINIDO;
        const categoryCell = row.querySelector("td[data-label='Categoria']");
        const dueDateCell = row.querySelector("td[data-label='Data de vencimento']");
        const valueInput = row.querySelector("td[data-label='Valor (R$)'] input");

        const logoImg = institutionCell ? institutionCell.querySelector("img.logo-banco") : null;
        let institutionNameText = getActualExpenseNameFromCell(institutionCell);


        const predefinedInst = PREDEFINED_INSTITUTIONS.find(inst => inst.name === institutionNameText || (logoImg && inst.logo === logoImg.src));
        const institutionId = predefinedInst ? predefinedInst.id : `custom_inst_${(institutionNameText || 'unknown').replace(/\s+/g, '_')}`;

        let dueDateModal = '';
        const dueDateTextoTabela = dueDateCell ? dueDateCell.textContent.trim() : '';
        if (dueDateTextoTabela !== TEXTO_NAO_DEFINIDO && dueDateTextoTabela.startsWith("Dia ")) {
            dueDateModal = dueDateTextoTabela.replace("Dia ", "").trim();
            dueDateModal = formatarDiaComZero(dueDateModal); // MODIFICADO: Formata o dia
        } else if (dueDateTextoTabela === TEXTO_NAO_DEFINIDO) {
            dueDateModal = '';
        }

        cartoesModal.push({
            id: `card_modal_${Date.now()}_${i}`,
            institutionId: institutionId,
            institutionName: institutionNameText,
            customName: (customNameText === '' || customNameText === TEXTO_NAO_DEFINIDO) ? TEXTO_NAO_DEFINIDO : customNameText,
            category: categoryCell ? categoryCell.textContent.trim() : '',
            dueDate: dueDateModal,
            logo: logoImg ? logoImg.src : 'imgs/card-default.png',
            value: valueInput ? valueInput.value : 'R$ 0,00'
        });
    }
    renderizarListaModal();
    document.getElementById("modalCartoes").style.display = 'flex';
}
function fecharModalCartoes() {
    document.getElementById("modalCartoes").style.display = 'none';
}
function renderizarListaModal() {
    const lista = document.getElementById("listaCartoesModal");
    lista.innerHTML = '';
    cartoesModal.forEach(cartao => {
        const li = document.createElement("li");
        li.setAttribute("data-id", cartao.id);
        li.setAttribute("draggable", true);

        const customNameActual = cartao.customName || TEXTO_NAO_DEFINIDO;
        let customNameLineHtml = '';
        if (customNameActual === TEXTO_NAO_DEFINIDO) {
            customNameLineHtml = `<span class="card-custom-name">Nome: <span class="texto-opaco">${TEXTO_NAO_DEFINIDO}</span></span>`;
        } else {
            customNameLineHtml = `<span class="card-custom-name">${customNameActual}</span>`;
        }

        let dueDateDisplay = '';
        const isNoDueDateInstitution = cartao.institutionId === CARD_INSTITUTION_NO_DUE_DATE_ID;
        // MODIFICADO: Usa o cartao.dueDate já formatado
        if (!isNoDueDateInstitution && cartao.dueDate && cartao.dueDate.trim() !== '') {
            dueDateDisplay = `Dia ${cartao.dueDate}`;
        } else if (isNoDueDateInstitution || !cartao.dueDate || cartao.dueDate.trim() === '') {
            dueDateDisplay = `<span class="texto-opaco">${TEXTO_NAO_DEFINIDO}</span>`;
        }

        const logoSrc = cartao.logo || 'imgs/card-default.png';

        li.innerHTML = `
            <div class="card-info">
                <img src="${logoSrc}" alt="${cartao.institutionName}" class="logo-banco">
                <div class="card-details">
                    <strong class="card-institution-name">${cartao.institutionName}</strong>
                    ${customNameLineHtml}
                    <span class="card-category-detail">Categoria: ${cartao.categoryName || cartao.category}</span>
                    ${dueDateDisplay ? `<span class="card-due-date-detail">Vencimento: ${dueDateDisplay}</span>` : ''}
                </div>
            </div>
            <div class="card-actions">
                <button class="btn-modal-action btn-modal-edit html2canvas-ignore" onclick="editarCartaoModal('${cartao.id}')" title="Editar">✏️</button>
                <button class="btn-modal-action btn-modal-remove html2canvas-ignore" onclick="excluirCartaoModal('${cartao.id}')" title="Remover"></button>
            </div>`;
        lista.appendChild(li);
    });
    addDragDropListeners();
}
async function abrirFormularioAdicionarCartao() {
    const institutionOptions = PREDEFINED_INSTITUTIONS.map(inst => `<option value="${inst.id}">${inst.name}</option>`).join('') + `<option value="outra_instituicao">🏦 Outra Instituição...</option>`;
    const categoryOptions = PREDEFINED_CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    let dayOptionsHtml = `<option value="${VALOR_SELECT_SEM_VENCIMENTO}">${TEXTO_NAO_DEFINIDO}</option>`;
    for (let i = 1; i <= 31; i++) { dayOptionsHtml += `<option value="${i}">${i}</option>`; }
    const { value: formValues, isConfirmed } = await Swal.fire({
        title: 'Adicionar Novo Cartão',
        html: `
            <div style="text-align: left; margin-bottom: 1rem;"><label for="swal-institution" style="display: block; margin-bottom: .3rem; font-weight: bold;">Instituição:</label><select id="swal-institution" class="swal2-select" style="width: 100%;"><option value=""></option>${institutionOptions}</select></div>
            <div id="swal-custom-institution-container" style="text-align: left; margin-bottom: 1rem; display: none;"><label for="swal-custom-institution" style="display: block; margin-bottom: .3rem; font-weight: bold;">Nome da Instituição:</label><input id="swal-custom-institution" class="swal2-input" placeholder="Digite o nome da instituição"></div>
            <div style="text-align: left; margin-bottom: 1rem;"><label for="swal-card-name" style="display: block; margin-bottom: .3rem; font-weight: bold;">Nome Personalizado (Opcional):</label><input id="swal-card-name" class="swal2-input" placeholder="Ex: Mastercard"></div>
            <div style="text-align: left; margin-bottom: 1rem;"><label for="swal-category" style="display: block; margin-bottom: .3rem; font-weight: bold;">Categoria:</label><select id="swal-category" class="swal2-select" style="width: 100%;"><option value=""></option>${categoryOptions}</select></div>
            <div id="swal-custom-category-container" style="text-align: left; margin-bottom: 1rem; display: none;"><label for="swal-custom-category" style="display: block; margin-bottom: .3rem; font-weight: bold;">Categoria Personalizada:</label><input id="swal-custom-category" class="swal2-input" placeholder="Digite a categoria"></div>
            <div id="swal-card-due-date-container" style="text-align: left; margin-bottom: 1rem;"><label for="swal-due-date" style="display: block; margin-bottom: .3rem; font-weight: bold;">Dia do Vencimento:</label><select id="swal-due-date" class="swal2-select" style="width: 100%;"><option value=""></option>${dayOptionsHtml}</select></div>`,
        focusConfirm: false, showCancelButton: true, confirmButtonText: 'Adicionar', cancelButtonText: 'Cancelar', customClass: { popup: 'swal2-dark' },
        didOpen: () => {
            const swalPopup = Swal.getPopup();
            const institutionSelect = $('#swal-institution');
            const customInstitutionContainer = document.getElementById('swal-custom-institution-container');
            const customInstitutionInput = document.getElementById('swal-custom-institution');
            const categorySelect = $('#swal-category');
            const customCategoryContainer = document.getElementById('swal-custom-category-container');
            const customCategoryInput = document.getElementById('swal-custom-category');
            const cardDueDateContainer = document.getElementById('swal-card-due-date-container');
            const dueDateSelect = $('#swal-due-date');

            institutionSelect.select2({ placeholder: "-- Selecione Instituição --", allowClear: true, theme: "bootstrap-5", dropdownParent: swalPopup })
                .on('change', function () {
                    const selectedInstitutionId = $(this).val();
                    const noDueDate = (selectedInstitutionId === CARD_INSTITUTION_NO_DUE_DATE_ID);
                    const showCustomInstitution = (selectedInstitutionId === 'outra_instituicao');

                    customInstitutionContainer.style.display = showCustomInstitution ? 'block' : 'none';
                    if (showCustomInstitution) { setTimeout(() => customInstitutionInput.focus(), 100); }
                    else { customInstitutionInput.value = ''; }

                    cardDueDateContainer.style.display = noDueDate ? 'none' : 'block';
                    if (noDueDate) {
                        categorySelect.val(CATEGORIA_ALIMENTACAO_CARTAO_NOME).trigger('change.select2').prop('disabled', true);
                        dueDateSelect.val(VALOR_SELECT_SEM_VENCIMENTO).trigger('change.select2');
                    } else {
                        categorySelect.prop('disabled', false);
                        if (categorySelect.val() === CATEGORIA_ALIMENTACAO_CARTAO_NOME && !$('#swal-category option:selected').data('user-selected')) {
                            // Lógica adicional se necessário
                        }
                    }
                });
            categorySelect.select2({ placeholder: "-- Selecione Categoria --", allowClear: true, theme: "bootstrap-5", dropdownParent: swalPopup }).on('change', function () { if (!$(this).prop('disabled')) { $('#swal-category option:selected').data('user-selected', true); } const selectedCategory = $(this).val(); const showCustom = (selectedCategory === "🎁 Outros"); customCategoryContainer.style.display = showCustom ? 'block' : 'none'; if (!showCustom) { customCategoryInput.value = ''; } });
            dueDateSelect.select2({ placeholder: "-- Dia --", allowClear: true, theme: "bootstrap-5", dropdownParent: swalPopup });

            const initialSelectedInstitutionId = institutionSelect.val();
            customInstitutionContainer.style.display = (initialSelectedInstitutionId === 'outra_instituicao') ? 'block' : 'none';
            cardDueDateContainer.style.display = (initialSelectedInstitutionId === CARD_INSTITUTION_NO_DUE_DATE_ID) ? 'none' : 'block';
            if (initialSelectedInstitutionId === CARD_INSTITUTION_NO_DUE_DATE_ID) {
                categorySelect.val(CATEGORIA_ALIMENTACAO_CARTAO_NOME).trigger('change.select2').prop('disabled', true);
                dueDateSelect.val(VALOR_SELECT_SEM_VENCIMENTO).trigger('change.select2');
            } else {
                categorySelect.prop('disabled', false);
            }
        },
        preConfirm: () => {
            let institutionId = $('#swal-institution').val();
            let institutionName = '';
            let logo = 'imgs/card-default.png';

            if (institutionId === 'outra_instituicao') {
                institutionName = document.getElementById('swal-custom-institution').value.trim();
                if (!institutionName) { Swal.showValidationMessage('Digite o nome da nova instituição.'); return false; }
                institutionId = `custom_inst_${institutionName.replace(/\s+/g, '_')}`;
            } else if (institutionId) {
                const predefined = PREDEFINED_INSTITUTIONS.find(i => i.id === institutionId);
                if (predefined) {
                    institutionName = predefined.name;
                    logo = predefined.logo;
                } else {
                    Swal.showValidationMessage('Instituição inválida.'); return false;
                }
            } else {
                Swal.showValidationMessage('Selecione uma instituição.'); return false;
            }

            let customName = document.getElementById('swal-card-name').value.trim();
            if (customName === '') { customName = TEXTO_NAO_DEFINIDO; }

            let category = $('#swal-category').val();
            const customCategory = document.getElementById('swal-custom-category').value.trim();
            let dueDateValue = $('#swal-due-date').val();
            let dueDate = '';
            const cardDueDateContainerIsVisible = document.getElementById('swal-card-due-date-container').style.display !== 'none';

            if (institutionId === CARD_INSTITUTION_NO_DUE_DATE_ID) {
                category = CATEGORIA_ALIMENTACAO_CARTAO_NOME;
            } else if (category === "🎁 Outros") {
                if (!customCategory) { Swal.showValidationMessage('Digite a categoria personalizada.'); return false; }
                category = customCategory;
            } else if (!category) {
                Swal.showValidationMessage('Selecione uma categoria.'); return false;
            }

            if (institutionId === CARD_INSTITUTION_NO_DUE_DATE_ID || !cardDueDateContainerIsVisible) {
                dueDate = '';
            } else {
                if (dueDateValue === VALOR_SELECT_SEM_VENCIMENTO || !dueDateValue) {
                    dueDate = ''; // Não definido
                } else if (dueDateValue && dueDateValue.trim() !== '') {
                    dueDate = formatarDiaComZero(dueDateValue.trim()); // MODIFICADO: Formata o dia
                } else {
                    Swal.showValidationMessage('Selecione um dia de vencimento ou "Não definido".'); return false;
                }
            }
            return { institutionId, institutionName, customName, category, dueDate, logo };
        }
    });
    if (isConfirmed && formValues) {
        cartoesModal.push({
            id: `card_modal_${Date.now()}`,
            institutionId: formValues.institutionId,
            institutionName: formValues.institutionName,
            customName: formValues.customName,
            category: formValues.category,
            dueDate: formValues.dueDate,
            logo: formValues.logo,
            value: 'R$ 0,00'
        });
        renderizarListaModal();
    }
}
async function editarCartaoModal(id) {
    const cartaoIndex = cartoesModal.findIndex(c => c.id === id); if (cartaoIndex === -1) return;
    const cartao = cartoesModal[cartaoIndex];
    const customNameToEdit = (cartao.customName === '' || cartao.customName === TEXTO_NAO_DEFINIDO) ? '' : cartao.customName;
    const customNamePlaceholder = TEXTO_NAO_DEFINIDO;

    const isCustomCategory = !PREDEFINED_CATEGORIES.includes(cartao.category);
    const initialCategory = isCustomCategory ? "🎁 Outros" : cartao.category;
    const customCategoryValue = isCustomCategory ? cartao.category : "";
    const categoryOptions = PREDEFINED_CATEGORIES.map(cat => `<option value="${cat}" ${cat === initialCategory ? 'selected' : ''}>${cat}</option>`).join('');

    let dayOptionsHtml = `<option value="${VALOR_SELECT_SEM_VENCIMENTO}">${TEXTO_NAO_DEFINIDO}</option>`;
    for (let i = 1; i <= 31; i++) {
        // MODIFICADO: Compara com valor formatado ou não formatado
        const diaFormatado = formatarDiaComZero(String(i));
        const selected = (cartao.dueDate && (cartao.dueDate === String(i) || cartao.dueDate === diaFormatado)) ? 'selected' : '';
        dayOptionsHtml += `<option value="${i}" ${selected}>${i}</option>`;
    }

    const initialCardDueDateVisible = cartao.institutionId !== CARD_INSTITUTION_NO_DUE_DATE_ID;
    const isCategoryDisabled = cartao.institutionId === CARD_INSTITUTION_NO_DUE_DATE_ID;

    const { value: formValues } = await Swal.fire({
        title: 'Editar Cartão',
        html: `
            <div style="text-align: left; margin-bottom: .5rem;"><em>Instituição: ${cartao.institutionName} (não editável)</em></div>
            <div style="text-align: left; margin-bottom: 1rem;"><label for="swal-edit-card-name" style="display: block; margin-bottom: .3rem; font-weight: bold;">Nome Personalizado (Opcional):</label><input id="swal-edit-card-name" class="swal2-input" value="${customNameToEdit}" placeholder="${customNamePlaceholder}"></div>
            <div style="text-align: left; margin-bottom: 1rem;"><label for="swal-edit-category" style="display: block; margin-bottom: .3rem; font-weight: bold;">Categoria:</label><select id="swal-edit-category" class="swal2-select" style="width: 100%;" ${isCategoryDisabled ? 'disabled' : ''}>${categoryOptions}</select></div>
            <div id="swal-edit-custom-category-container" style="text-align: left; margin-bottom: 1rem; display: ${isCustomCategory ? 'block' : 'none'};"><label for="swal-edit-custom-category" style="display: block; margin-bottom: .3rem; font-weight: bold;">Categoria Personalizada:</label><input id="swal-edit-custom-category" class="swal2-input" placeholder="Digite a categoria" value="${customCategoryValue}"></div>
            <div id="swal-edit-card-due-date-container" style="text-align: left; margin-bottom: 1rem; display: ${initialCardDueDateVisible ? 'block' : 'none'};"><label for="swal-edit-due-date" style="display: block; margin-bottom: .3rem; font-weight: bold;">Dia do Vencimento:</label><select id="swal-edit-due-date" class="swal2-select" style="width: 100%;"><option value=""></option>${dayOptionsHtml}</select></div>`,
        focusConfirm: false, showCancelButton: true, confirmButtonText: 'Salvar', cancelButtonText: 'Cancelar', customClass: { popup: 'swal2-dark' },
        didOpen: () => {
            const swalPopup = Swal.getPopup();
            const categorySelect = $('#swal-edit-category');
            const customCategoryContainer = document.getElementById('swal-edit-custom-category-container');
            const customCategoryInput = document.getElementById('swal-edit-custom-category');

            categorySelect.select2({ theme: "bootstrap-5", dropdownParent: swalPopup }).on('change', function () {
                const selectedCategory = $(this).val();
                const showCustom = (selectedCategory === "🎁 Outros");
                customCategoryContainer.style.display = showCustom ? 'block' : 'none';
                if (!showCustom) { customCategoryInput.value = ''; }
            });

            const showCustomInitial = (categorySelect.val() === "🎁 Outros");
            customCategoryContainer.style.display = showCustomInitial ? 'block' : 'none';
            // MODIFICADO: Usa parseInt para pegar o valor numérico do dia para o select
            const diaSelecionar = cartao.dueDate ? parseInt(cartao.dueDate, 10) : VALOR_SELECT_SEM_VENCIMENTO;
            $('#swal-edit-due-date').select2({ placeholder: "-- Dia --", allowClear: true, theme: "bootstrap-5", dropdownParent: swalPopup }).val(String(diaSelecionar)).trigger('change.select2');
            if (isCategoryDisabled) { categorySelect.val(CATEGORIA_ALIMENTACAO_CARTAO_NOME).trigger('change.select2'); }
        },
        preConfirm: () => {
            let customName = document.getElementById('swal-edit-card-name').value.trim();
            if (customName === '') { customName = TEXTO_NAO_DEFINIDO; }

            let category = $('#swal-edit-category').val();
            const customInputSwal = document.getElementById('swal-edit-custom-category');
            let dueDateValue = $('#swal-edit-due-date').val();
            let dueDate = '';
            const cardDueDateContainerIsVisible = document.getElementById('swal-edit-card-due-date-container').style.display !== 'none';

            if (cartao.institutionId === CARD_INSTITUTION_NO_DUE_DATE_ID) {
                category = CATEGORIA_ALIMENTACAO_CARTAO_NOME;
            } else if (category === "🎁 Outros") {
                category = customInputSwal.value.trim();
                if (!category) { Swal.showValidationMessage('Digite a categoria personalizada.'); return false; }
            }

            if (cartao.institutionId === CARD_INSTITUTION_NO_DUE_DATE_ID || !cardDueDateContainerIsVisible) {
                dueDate = '';
            } else {
                 if (dueDateValue === VALOR_SELECT_SEM_VENCIMENTO || !dueDateValue) {
                    dueDate = ''; // Não definido
                } else if (dueDateValue && dueDateValue.trim() !== '') {
                    dueDate = formatarDiaComZero(dueDateValue.trim()); // MODIFICADO: Formata o dia
                } else {
                    Swal.showValidationMessage('Selecione um dia de vencimento ou "Não definido".'); return false;
                }
            }
            return { customName, category, dueDate };
        }
    });
    if (formValues) {
        cartoesModal[cartaoIndex].customName = formValues.customName;
        cartoesModal[cartaoIndex].category = formValues.category;
        cartoesModal[cartaoIndex].dueDate = formValues.dueDate;
        renderizarListaModal();
    }
}
function excluirCartaoModal(id) {
    Swal.fire({ title: 'Tem certeza?', text: "Este cartão será removido!", icon: 'warning', showCancelButton: true, confirmButtonText: 'Sim, remover!', cancelButtonText: 'Cancelar', customClass: { popup: 'swal2-dark' } }).then((result) => { if (result.isConfirmed) { cartoesModal = cartoesModal.filter(c => c.id !== id); renderizarListaModal(); Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cartão removido!', showConfirmButton: false, timer: 1500, customClass: { popup: 'swal2-dark' } }); } });
}
function salvarModalCartoes() {
    const tabelaBody = document.getElementById("tabelaCartoes").getElementsByTagName('tbody')[0];
    tabelaBody.innerHTML = '';
    cartoesModal.forEach(cartao => {
        const newRow = tabelaBody.insertRow();

        const cellInstitution = newRow.insertCell();
        cellInstitution.setAttribute('data-label', 'Instituição');
        const logoSrcSalvar = cartao.logo || 'imgs/card-default.png';
        cellInstitution.innerHTML = `<img src="${logoSrcSalvar}" alt="${cartao.institutionName}" class="logo-banco" /><span class="expense-name">${cartao.institutionName}</span>`;

        const cellCustomName = newRow.insertCell();
        cellCustomName.setAttribute('data-label', 'Cartão');
        cellCustomName.innerHTML = `<span class="expense-name">${cartao.customName || TEXTO_NAO_DEFINIDO}</span>`;
        if ((cartao.customName || TEXTO_NAO_DEFINIDO) === TEXTO_NAO_DEFINIDO) {
            cellCustomName.classList.add('texto-opaco');
        } else {
            cellCustomName.classList.remove('texto-opaco');
        }

        const cellCategory = newRow.insertCell();
        cellCategory.setAttribute('data-label', 'Categoria');
        cellCategory.textContent = cartao.category;

        const cellDueDate = newRow.insertCell();
        cellDueDate.setAttribute('data-label', 'Data de vencimento');
        cellDueDate.style.textAlign = 'center';
        // MODIFICADO: Usa o cartao.dueDate já formatado
        if (cartao.institutionId === CARD_INSTITUTION_NO_DUE_DATE_ID || !cartao.dueDate) {
            cellDueDate.textContent = TEXTO_NAO_DEFINIDO;
            cellDueDate.classList.add('texto-opaco');
        } else {
            cellDueDate.textContent = `Dia ${cartao.dueDate}`;
            cellDueDate.classList.remove('texto-opaco');
        }

        const cellValue = newRow.insertCell();
        cellValue.setAttribute('data-label', 'Valor (R$)');
        const inputValor = document.createElement('input');
        inputValor.type = 'text';
        inputValor.value = cartao.value;
        inputValor.oninput = () => formatarInput(inputValor);
        formatarInput(inputValor);
        addInputListenersToElement(inputValor);
        cellValue.appendChild(inputValor);
    });
    fecharModalCartoes();
    salvarDados();
}
function addDragDropListeners() {
    const items = document.querySelectorAll("#listaCartoesModal li"); items.forEach(item => { item.addEventListener('dragstart', handleDragStart); item.addEventListener('dragover', handleDragOver); item.addEventListener('drop', handleDrop); item.addEventListener('dragend', handleDragEnd); });
}
function handleDragStart(e) {
    draggedItem = this; this.classList.add('dragging'); if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/html', this.innerHTML); }
}
function handleDragOver(e) {
    e.preventDefault(); if (e.dataTransfer) { e.dataTransfer.dropEffect = 'move'; }
}
function handleDrop(e) {
    e.preventDefault(); const targetItem = e.target.closest('li');
    if (targetItem && targetItem !== draggedItem) {
        const draggedId = draggedItem.getAttribute('data-id'); const targetId = targetItem.getAttribute('data-id');
        const draggedIndex = cartoesModal.findIndex(c => c.id === draggedId); const targetIndex = cartoesModal.findIndex(c => c.id === targetId);
        if (draggedIndex !== -1 && targetIndex !== -1) { const [movedItem] = cartoesModal.splice(draggedIndex, 1); cartoesModal.splice(targetIndex, 0, movedItem); renderizarListaModal(); }
    }
}
function handleDragEnd() {
    this.classList.remove('dragging'); draggedItem = null;
}

// ==========================================================================
// PERSISTÊNCIA DE DADOS (LOCALSTORAGE)
// ==========================================================================
function salvarDados() {
    const dados = {
        renda: document.getElementById("renda").value,
        fixas: [...document.querySelectorAll("#tabelaFixas tbody tr")].map(row => {
            const originalIdFromDataset = row.dataset.originalId;
            const nameCell = row.querySelector("td[data-label='Conta']");
            const logoImg = nameCell ? nameCell.querySelector("img.logo-banco") : null;
            let expenseName = getActualExpenseNameFromCell(nameCell);

            const dueDateCell = row.querySelector("td[data-label='Data de vencimento']");
            let dueDateSalvo = '';
            const dueDateTextoTabela = dueDateCell ? dueDateCell.textContent.trim() : '';
            if (dueDateTextoTabela !== TEXTO_NAO_DEFINIDO && dueDateTextoTabela.startsWith("Dia ")) {
                dueDateSalvo = dueDateTextoTabela.replace("Dia ", "").trim();
                // A formatação para "0X" já deve estar no texto da tabela
            }

            const valueInput = row.querySelector("td[data-label='Valor (R$)'] input[type='text']");
            return {
                name: expenseName,
                logo: logoImg ? logoImg.src : '',
                dueDate: dueDateSalvo, // Será "0X" se a tabela exibe assim
                value: valueInput ? valueInput.value : "R$ 0,00",
                originalId: originalIdFromDataset || `custom_${(expenseName || '').replace(/\s+/g, '_')}`
            };
        }),
        cartoes: [...document.querySelectorAll("#tabelaCartoes tbody tr")].map(row => {
            const institutionCell = row.querySelector("td[data-label='Instituição']");
            const logoImg = institutionCell ? institutionCell.querySelector("img.logo-banco") : null;
            let institutionName = getActualExpenseNameFromCell(institutionCell);

            const predefinedInst = PREDEFINED_INSTITUTIONS.find(inst => inst.name === institutionName || (logoImg && inst.logo === logoImg.src));
            const institutionId = predefinedInst ? predefinedInst.id : `custom_inst_${(institutionName || 'unknown').replace(/\s+/g, '_')}`;

            const customNameCell = row.querySelector("td[data-label='Cartão']");
            const customNameSalvo = getActualExpenseNameFromCell(customNameCell);


            const categoryCell = row.querySelector("td[data-label='Categoria']");
            const categorySalvo = categoryCell ? categoryCell.textContent.trim() : '';

            const dueDateCell = row.querySelector("td[data-label='Data de vencimento']");
            let dueDateSalvo = '';
            const dueDateTextoTabela = dueDateCell ? dueDateCell.textContent.trim() : '';
            if (dueDateTextoTabela !== TEXTO_NAO_DEFINIDO && dueDateTextoTabela.startsWith("Dia ")) {
                dueDateSalvo = dueDateTextoTabela.replace("Dia ", "").trim();
                // A formatação para "0X" já deve estar no texto da tabela
            }

            const valueInput = row.querySelector("td[data-label='Valor (R$)'] input");
            const valorSalvo = valueInput ? valueInput.value : "R$ 0,00";

            return {
                institutionId: institutionId,
                institutionName: institutionName,
                customName: customNameSalvo,
                category: categorySalvo,
                dueDate: dueDateSalvo, // Será "0X" se a tabela exibe assim
                value: valorSalvo,
                logo: logoImg ? logoImg.src : 'imgs/card-default.png'
            };
        }),
        investimentos: [...document.querySelectorAll("#tabelaInvestimentos tbody tr")].map(linha => {
            const nomeInput = linha.querySelector("td[data-label='Investimento'] input");
            const percInput = linha.querySelector("td[data-label='%'] input");
            return {
                nome: nomeInput ? nomeInput.value : '',
                percentual: percInput ? percInput.value : ''
            }
        })
    };
    localStorage.setItem("dadosFinanceiros", JSON.stringify(dados));
}

function carregarDados() {
    const dadosString = localStorage.getItem("dadosFinanceiros");
    const tabelaFixasBody = document.getElementById("tabelaFixas").getElementsByTagName('tbody')[0];
    const tabelaCartoesBody = document.getElementById("tabelaCartoes").getElementsByTagName('tbody')[0];
    const tabelaInvestimentosBody = document.getElementById("tabelaInvestimentos").getElementsByTagName('tbody')[0];

    const criarLinhaFixa = (fixa) => {
        const newRow = tabelaFixasBody.insertRow();
        newRow.dataset.originalId = fixa.originalId;

        const cellName = newRow.insertCell();
        cellName.setAttribute('data-label', 'Conta');
        const displayName = fixa.name || TEXTO_NAO_DEFINIDO;

        const logoHtml = fixa.logo ? `<img src="${fixa.logo}" alt="${displayName}" class="logo-banco" />` : '';
        cellName.innerHTML = `${logoHtml}<span class="expense-name">${displayName}</span>`;

        if (displayName === TEXTO_NAO_DEFINIDO && !fixa.logo) {
            cellName.classList.add('texto-opaco');
        } else {
            cellName.classList.remove('texto-opaco');
        }

        const cellDueDate = newRow.insertCell();
        cellDueDate.setAttribute('data-label', 'Data de vencimento');
        cellDueDate.style.textAlign = 'center';
        const isNoDueDateFixa = FIXED_EXPENSES_NO_DUE_DATE_IDS.includes(fixa.originalId);

        // MODIFICADO: Formata o dia ao carregar
        if (isNoDueDateFixa || !fixa.dueDate) {
            cellDueDate.textContent = TEXTO_NAO_DEFINIDO;
            cellDueDate.classList.add('texto-opaco');
        } else {
            cellDueDate.textContent = `Dia ${formatarDiaComZero(fixa.dueDate)}`;
            cellDueDate.classList.remove('texto-opaco');
        }
        const cellValue = newRow.insertCell();
        cellValue.setAttribute('data-label', 'Valor (R$)');
        const inputValor = document.createElement('input');
        inputValor.type = 'text';
        inputValor.value = fixa.value || "R$ 0,00";
        inputValor.oninput = () => formatarInput(inputValor);
        formatarInput(inputValor);
        addInputListenersToElement(inputValor);
        cellValue.appendChild(inputValor);
    };

    const carregarPadroesFixas = () => {
        tabelaFixasBody.innerHTML = '';
        PREDEFINED_FIXED_EXPENSES.forEach((fixa) => criarLinhaFixa({ ...fixa, value: 'R$ 0,00', originalId: fixa.id, dueDate: FIXED_EXPENSES_NO_DUE_DATE_IDS.includes(fixa.id) ? '' : '10' })); // '10' já tem 2 dígitos
    };

    $('#mes').select2({ theme: "bootstrap-5", minimumResultsForSearch: Infinity });

    if (!dadosString) {
        carregarPadroesFixas();
        document.getElementById("secaoResumo").style.display = 'none';
        document.getElementById("secaoInvestir").style.display = 'none';
        initAccordions();
        return;
    }
    const dados = JSON.parse(dadosString);
    if (!dados) {
        carregarPadroesFixas();
        document.getElementById("secaoResumo").style.display = 'none';
        document.getElementById("secaoInvestir").style.display = 'none';
        initAccordions();
        return;
    }

    document.getElementById("renda").value = dados.renda || "R$ 0,00";
    formatarInput(document.getElementById("renda"));

    tabelaFixasBody.innerHTML = '';
    if (dados.fixas && dados.fixas.length > 0) { dados.fixas.forEach(fixa => criarLinhaFixa(fixa)); } else { carregarPadroesFixas(); }

    tabelaCartoesBody.innerHTML = '';
    if (dados.cartoes && dados.cartoes.length > 0) {
        dados.cartoes.forEach(cartao => {
            const newRow = tabelaCartoesBody.insertRow();

            const cellInstitution = newRow.insertCell();
            cellInstitution.setAttribute('data-label', 'Instituição');
            const institutionNameDisplay = cartao.institutionName || 'Instituição Desconhecida';
            const logoSrcCarregar = cartao.logo || 'imgs/card-default.png';
            cellInstitution.innerHTML = `<img src="${logoSrcCarregar}" alt="${institutionNameDisplay}" class="logo-banco" /><span class="expense-name">${institutionNameDisplay}</span>`;
            if (institutionNameDisplay === 'Instituição Desconhecida') {
                cellInstitution.classList.add('texto-opaco');
            }

            const cellCustomName = newRow.insertCell();
            cellCustomName.setAttribute('data-label', 'Cartão');
            cellCustomName.innerHTML = `<span class="expense-name">${cartao.customName || TEXTO_NAO_DEFINIDO}</span>`;
            if ((cartao.customName || TEXTO_NAO_DEFINIDO) === TEXTO_NAO_DEFINIDO) {
                cellCustomName.classList.add('texto-opaco');
            } else {
                cellCustomName.classList.remove('texto-opaco');
            }

            const cellCategory = newRow.insertCell();
            cellCategory.setAttribute('data-label', 'Categoria');
            cellCategory.textContent = cartao.category;

            const cellDueDate = newRow.insertCell();
            cellDueDate.setAttribute('data-label', 'Data de vencimento');
            cellDueDate.style.textAlign = 'center';
            // MODIFICADO: Formata o dia ao carregar
            if (cartao.institutionId === CARD_INSTITUTION_NO_DUE_DATE_ID || !cartao.dueDate) {
                cellDueDate.textContent = TEXTO_NAO_DEFINIDO;
                cellDueDate.classList.add('texto-opaco');
            } else {
                cellDueDate.textContent = `Dia ${formatarDiaComZero(cartao.dueDate)}`;
                cellDueDate.classList.remove('texto-opaco');
            }

            const cellValor = newRow.insertCell();
            cellValor.setAttribute('data-label', 'Valor (R$)');
            const inputValor = document.createElement('input');
            inputValor.type = 'text';
            inputValor.value = cartao.value;
            inputValor.oninput = () => formatarInput(inputValor);
            formatarInput(inputValor);
            addInputListenersToElement(inputValor);
            cellValor.appendChild(inputValor);
        });
    }

    tabelaInvestimentosBody.innerHTML = '';
    if (dados.investimentos && dados.investimentos.length > 0) {
        dados.investimentos.forEach(item => {
            adicionarInvestimento();
            const linhas = tabelaInvestimentosBody.querySelectorAll("tr");
            const ultima = linhas[linhas.length - 1];
            if (ultima) {
                ultima.querySelector("td[data-label='Investimento'] input").value = item.nome;
                const percInput = ultima.querySelector("td[data-label='%'] input");
                percInput.value = item.percentual;
                formatarPercentual(percInput);
            }
        });
    }

    if (paraNumero(dados.renda) > 0 || (dados.fixas && dados.fixas.some(f => paraNumero(f.value) > 0)) || (dados.cartoes && dados.cartoes.some(c => paraNumero(c.value) > 0))) {
        calcular();
    } else {
        document.getElementById("secaoResumo").style.display = 'none';
        document.getElementById("secaoInvestir").style.display = 'none';
        initAccordions();
    }
}

// ... (Restante do seu código JavaScript, como limparDados, salvarImagem, Listeners, initAccordions, DOMContentLoaded, window.onload, etc. permanece igual)

function limparDados() {
    Swal.fire({
        title: 'Tem certeza?',
        text: "Todos os dados serão apagados!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, limpar!',
        cancelButtonText: 'Cancelar',
        customClass: { popup: 'swal2-dark' }
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem("dadosFinanceiros");
            document.getElementById("secaoResumo").style.display = 'none';
            document.getElementById("secaoInvestir").style.display = 'none';
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Dados limpos!',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
                customClass: { popup: 'swal2-dark' }
            }).then(() => {
                location.reload();
            });
        }
    });
}
function salvarImagem() {
    const mesSelecionado = $('#mes').val();
    const nomeMes = mesSelecionado ? meses[mesSelecionado] : "MêsDesconhecido";
    const elemento = document.querySelector(".container");
    Swal.fire({
        title: 'Gerando imagem...',
        text: 'Aguarde um momento.',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); },
        customClass: { popup: 'swal2-dark' }
    });
    html2canvas(elemento, {
        backgroundColor: '#1e1e1e',
        scale: 3,
        useCORS: true,
        ignoreElements: (el) => el.classList.contains('html2canvas-ignore')
    }).then(canvas => {
        const imagemURL = canvas.toDataURL("image/png", 0.95);
        const link = document.createElement("a");
        link.href = imagemURL;
        link.download = `Relatório Financeiro (${nomeMes}).png`;
        link.click();
        Swal.close();
    }).catch(err => {
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Não foi possível gerar a imagem.',
            customClass: { popup: 'swal2-dark' }
        });
        console.error("Erro ao gerar imagem:", err);
    });
}

const formatarInputHandler = (e) => formatarInput(e.target);
const formatarPercentualHandler = (e) => {
    formatarPercentual(e.target);
    if (e.target.closest('table')?.id === 'tabelaInvestimentos' && e.target.closest("td[data-label='%']")) {
        atualizarInvestimentos();
    }
};

const setCursorToEndHandler = (e) => {
    const input = e.target;
    const parentTable = input.closest('table');
    const parentTd = input.closest('td');

    if (parentTable && parentTable.id === 'tabelaInvestimentos' && parentTd && parentTd.getAttribute('data-label') === '%' && input.value.includes('%')) {
        const pos = input.value.length - 1;
        input.setSelectionRange(pos, pos);
    } else {
        const pos = input.value.length;
        input.setSelectionRange(pos, pos);
    }
};

function handleInputFocusScroll(event) {
    const input = event.target;
    if ('ontouchstart' in window && !input.closest('.swal2-popup')) {
        setTimeout(() => {
            input.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
        }, 300);
    }
}

function addInputListenersToElement(element) {
    const inputs = element.matches('input[type="text"]') ? [element] : element.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
        input.removeEventListener('input', formatarInputHandler);
        input.removeEventListener('input', formatarPercentualHandler);
        input.removeEventListener('focus', setCursorToEndHandler);
        input.removeEventListener('click', setCursorToEndHandler);
        input.removeEventListener('focus', handleInputFocusScroll);

        const parentTable = input.closest('table');
        const parentTd = input.closest('td');

        let isCurrencyField = false;
        if (input.id === 'renda') {
            isCurrencyField = true;
        } else if (parentTd) {
            const dataLabel = parentTd.getAttribute('data-label');
            if (dataLabel === 'Valor (R$)') {
                isCurrencyField = true;
            }
        } else if (input.id === 'swal-fixa-edit-value' || input.id === 'swal-fixa-value') {
            isCurrencyField = true;
        }

        const isInvestmentPercentageInput = parentTd && parentTd.getAttribute('data-label') === '%' && parentTable && parentTable.id === 'tabelaInvestimentos';

        if (isCurrencyField) {
            input.addEventListener('input', formatarInputHandler);
        } else if (isInvestmentPercentageInput) {
            input.addEventListener('input', formatarPercentualHandler);
        }

        if (!input.readOnly) {
            input.addEventListener('focus', setCursorToEndHandler);
            input.addEventListener('click', setCursorToEndHandler);
            input.addEventListener('focus', handleInputFocusScroll);
        }
    });
}

function initAccordions() {
    const secaoHeaders = document.querySelectorAll('.container > .secao-header');

    secaoHeaders.forEach(header => {
        let indicator = header.querySelector('.accordion-indicator');
        if (!indicator) {
            indicator = document.createElement('span');
            indicator.classList.add('accordion-indicator');

            if (!header.querySelector('.accordion-indicator')) {
                header.appendChild(indicator);
            }
        }

        const contentWrapper = header.nextElementSibling;

        if (contentWrapper && contentWrapper.classList.contains('accordion-content')) {
            if (!contentWrapper.classList.contains('conteudo-ativo')) {
                contentWrapper.style.maxHeight = null;
                header.classList.remove('active');
            } else {
                contentWrapper.style.maxHeight = contentWrapper.scrollHeight + "px";
                header.classList.add('active');
            }

            header.addEventListener('click', function (event) {
                if (event.target.closest('.btn-gerenciar-secao')) {
                    return;
                }

                const isActive = contentWrapper.classList.contains('conteudo-ativo');

                if (isActive) {
                    contentWrapper.classList.remove('conteudo-ativo');
                    contentWrapper.style.maxHeight = null;
                    this.classList.remove('active');
                } else {
                    contentWrapper.classList.add('conteudo-ativo');
                    contentWrapper.style.maxHeight = contentWrapper.scrollHeight + "px";
                    this.classList.add('active');

                    setTimeout(() => {
                        const headerRect = this.getBoundingClientRect();
                        if (headerRect.top < 0 || headerRect.top > window.innerHeight * 0.3) {
                            this.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
                        }
                    }, 360);
                }
            });
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    addInputListenersToElement(document.body);

    document.body.addEventListener('input', function (event) {
        const target = event.target;
        if (target.tagName === 'INPUT' && target.type === 'text' && (target.closest('table') || target.id === 'renda')) {
            setTimeout(salvarDados, 200);
        }
    });
});

window.onload = function () {
    const splashScreen = document.getElementById('splash-screen');
    const minDisplayTime = 1500;
    const loadTime = Date.now() - performance.timing.navigationStart;

    const hideSplash = () => {
        if (splashScreen) {
            splashScreen.classList.add('hidden');
            setTimeout(() => {
                if (splashScreen.parentNode) {
                    splashScreen.parentNode.removeChild(splashScreen);
                }
            }, 800);
        }
    };

    if (loadTime < minDisplayTime) {
        setTimeout(hideSplash, minDisplayTime - loadTime);
    } else {
        hideSplash();
    }
};