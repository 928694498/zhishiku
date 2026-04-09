const API_BASE = '/api';

async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
        const config = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (data) config.body = JSON.stringify(data);
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        return await response.json();
    } catch (err) {
        console.error('API请求失败:', err);
        alert('请求失败，请稍后重试');
    }
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(tabId).classList.add('active');
        loadTabData(tabId);
    });
});

async function loadTabData(tabId) {
    switch (tabId) {
        case 'channels':
            await loadChannels();
            break;
        case 'price-sheets':
            await loadPriceSheets();
            await loadChannelsForSelect();
            break;
        case 'calculator':
            await loadPriceSheetsForCalc();
            break;
        case 'customers':
            await loadCustomers();
            break;
        case 'guides':
            await loadGuides();
            await loadChannelsForSelect();
            break;
        case 'faq':
            await loadFaq();
            break;
    }
}

async function loadChannels() {
    const result = await apiRequest('/channels');
    if (result && result.success) {
        const tbody = document.querySelector('#channels-table tbody');
        tbody.innerHTML = result.data.map(channel => `
            <tr>
                <td>${channel.id}</td>
                <td>${channel.name}</td>
                <td>${channel.code || '-'}</td>
                <td>${channel.description || '-'}</td>
                <td>
                    <button class="btn btn-danger btn-small" onclick="deleteChannel(${channel.id})">删除</button>
                </td>
            </tr>
        `).join('');
    }
}

async function loadChannelsForSelect() {
    const result = await apiRequest('/channels');
    if (result && result.success) {
        const options = result.data.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        const psChannel = document.getElementById('ps-channel');
        const guideChannel = document.getElementById('guide-channel');
        if (psChannel) psChannel.innerHTML = options;
        if (guideChannel) guideChannel.innerHTML = options;
    }
}

async function loadPriceSheets() {
    const result = await apiRequest('/price-sheets');
    if (result && result.success) {
        const tbody = document.querySelector('#price-sheets-table tbody');
        tbody.innerHTML = result.data.map(sheet => `
            <tr>
                <td>${sheet.id}</td>
                <td>${sheet.name}</td>
                <td>${sheet.channel_name || '-'}</td>
                <td>${sheet.destination_country || '-'}</td>
                <td>${sheet.volume_weight_factor || 5000}</td>
                <td>
                    <button class="btn btn-danger btn-small" onclick="deletePriceSheet(${sheet.id})">删除</button>
                </td>
            </tr>
        `).join('');
    }
}

async function loadPriceSheetsForCalc() {
    const result = await apiRequest('/price-sheets');
    if (result && result.success) {
        const select = document.getElementById('calc-price-sheet');
        select.innerHTML = result.data.map(s => `<option value="${s.id}">${s.name} (${s.channel_name || 'N/A'})</option>`).join('');
    }
}

async function loadCustomers() {
    const result = await apiRequest('/customers');
    if (result && result.success) {
        const tbody = document.querySelector('#customers-table tbody');
        tbody.innerHTML = result.data.map(customer => `
            <tr>
                <td>${customer.id}</td>
                <td>${customer.name}</td>
                <td>${customer.company || '-'}</td>
                <td>${customer.customer_type || '-'}</td>
                <td>${customer.contact_person || '-'}</td>
                <td>
                    <button class="btn btn-danger btn-small" onclick="deleteCustomer(${customer.id})">删除</button>
                </td>
            </tr>
        `).join('');
    }
}

async function loadGuides() {
    const result = await apiRequest('/operation-guides');
    if (result && result.success) {
        const tbody = document.querySelector('#guides-table tbody');
        tbody.innerHTML = result.data.map(guide => `
            <tr>
                <td>${guide.id}</td>
                <td>${guide.channel_name || '-'}</td>
                <td>${guide.title}</td>
                <td>${guide.step_order}</td>
                <td>${guide.contact_person || '-'}</td>
                <td>
                    <button class="btn btn-danger btn-small" onclick="deleteGuide(${guide.id})">删除</button>
                </td>
            </tr>
        `).join('');
    }
}

async function loadFaq() {
    const searchInput = document.getElementById('faq-search');
    const q = searchInput ? searchInput.value : '';
    const endpoint = q ? `/faq?q=${encodeURIComponent(q)}` : '/faq';
    const result = await apiRequest(endpoint);
    if (result && result.success) {
        const tbody = document.querySelector('#faq-table tbody');
        tbody.innerHTML = result.data.map(faq => `
            <tr>
                <td>${faq.id}</td>
                <td>${faq.question}</td>
                <td>${faq.category || '-'}</td>
                <td>${faq.keywords || '-'}</td>
                <td>
                    <button class="btn btn-danger btn-small" onclick="deleteFaq(${faq.id})">删除</button>
                </td>
            </tr>
        `).join('');
    }
}

document.getElementById('faq-search')?.addEventListener('input', debounce(loadFaq, 300));

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

document.getElementById('channel-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('channel-name').value,
        code: document.getElementById('channel-code').value,
        description: document.getElementById('channel-description').value
    };
    const result = await apiRequest('/channels', 'POST', data);
    if (result && result.success) {
        alert('创建成功！');
        hideModal('channel-modal');
        e.target.reset();
        loadChannels();
    }
});

document.getElementById('price-sheet-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        channel_id: parseInt(document.getElementById('ps-channel').value),
        name: document.getElementById('ps-name').value,
        destination_country: document.getElementById('ps-destination').value,
        volume_weight_factor: parseInt(document.getElementById('ps-volume-factor').value) || 5000
    };
    const result = await apiRequest('/price-sheets', 'POST', data);
    if (result && result.success) {
        alert('创建成功！');
        hideModal('price-sheet-modal');
        e.target.reset();
        loadPriceSheets();
    }
});

document.getElementById('customer-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('customer-name').value,
        company: document.getElementById('customer-company').value,
        customer_type: document.getElementById('customer-type').value,
        contact_person: document.getElementById('customer-contact').value,
        contact_phone: document.getElementById('customer-phone').value,
        contact_email: document.getElementById('customer-email').value
    };
    const result = await apiRequest('/customers', 'POST', data);
    if (result && result.success) {
        alert('创建成功！');
        hideModal('customer-modal');
        e.target.reset();
        loadCustomers();
    }
});

document.getElementById('guide-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        channel_id: parseInt(document.getElementById('guide-channel').value),
        title: document.getElementById('guide-title').value,
        step_order: parseInt(document.getElementById('guide-order').value),
        content: document.getElementById('guide-content').value,
        contact_person: document.getElementById('guide-contact-person').value,
        contact_info: document.getElementById('guide-contact-info').value
    };
    const result = await apiRequest('/operation-guides', 'POST', data);
    if (result && result.success) {
        alert('创建成功！');
        hideModal('guide-modal');
        e.target.reset();
        loadGuides();
    }
});

document.getElementById('faq-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        question: document.getElementById('faq-question').value,
        answer: document.getElementById('faq-answer').value,
        category: document.getElementById('faq-category').value,
        keywords: document.getElementById('faq-keywords').value
    };
    const result = await apiRequest('/faq', 'POST', data);
    if (result && result.success) {
        alert('创建成功！');
        hideModal('faq-modal');
        e.target.reset();
        loadFaq();
    }
});

document.getElementById('calculator-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        price_sheet_id: parseInt(document.getElementById('calc-price-sheet').value),
        actual_weight: parseFloat(document.getElementById('calc-weight').value),
        length: parseFloat(document.getElementById('calc-length').value),
        width: parseFloat(document.getElementById('calc-width').value),
        height: parseFloat(document.getElementById('calc-height').value)
    };
    const result = await apiRequest('/pricing/calculate', 'POST', data);
    if (result && result.success) {
        displayCalculationResult(result.data);
    }
});

function displayCalculationResult(calc) {
    const resultDiv = document.getElementById('calculation-result');
    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = `
        <h3>📦 运费计算结果</h3>
        <div class="result-section">
            <h4>货物信息</h4>
            <div class="result-grid">
                <div class="result-item">
                    <div class="result-item-label">实际重量</div>
                    <div class="result-item-value">${calc.weight.actual} kg</div>
                </div>
                <div class="result-item">
                    <div class="result-item-label">体积重</div>
                    <div class="result-item-value">${calc.weight.volume} kg</div>
                </div>
                <div class="result-item">
                    <div class="result-item-label">计费重量</div>
                    <div class="result-item-value">${calc.weight.chargeable} kg</div>
                </div>
                <div class="result-item">
                    <div class="result-item-label">体积重系数</div>
                    <div class="result-item-value">${calc.priceSheet.volumeWeightFactor}</div>
                </div>
            </div>
        </div>
        <div class="result-section">
            <h4>费用明细</h4>
            <div class="result-grid">
                <div class="result-item">
                    <div class="result-item-label">基础运费</div>
                    <div class="result-item-value">¥${calc.cost.base}</div>
                </div>
                <div class="result-item">
                    <div class="result-item-label">燃油附加费</div>
                    <div class="result-item-value">¥${calc.cost.fuelSurcharge}</div>
                </div>
                <div class="result-item">
                    <div class="result-item-label">其他附加费</div>
                    <div class="result-item-value">¥${calc.cost.additional}</div>
                </div>
                <div class="result-item">
                    <div class="result-item-label">总计</div>
                    <div class="result-item-value highlight">¥${calc.cost.total}</div>
                </div>
            </div>
        </div>
        ${calc.feeDetails.length > 0 ? `
        <div class="result-section">
            <h4>附加费明细</h4>
            <div class="fee-list">
                ${calc.feeDetails.map(f => `
                    <div class="fee-item">
                        <span class="fee-name">${f.name}</span>
                        <span class="fee-amount">¥${f.amount.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
    `;
}

async function deleteChannel(id) {
    if (confirm('确定要删除这个渠道吗？')) {
        await apiRequest(`/channels/${id}`, 'DELETE');
        loadChannels();
    }
}

async function deletePriceSheet(id) {
    if (confirm('确定要删除这个报价单吗？')) {
        await apiRequest(`/price-sheets/${id}`, 'DELETE');
        loadPriceSheets();
    }
}

async function deleteCustomer(id) {
    if (confirm('确定要删除这个客户吗？')) {
        await apiRequest(`/customers/${id}`, 'DELETE');
        loadCustomers();
    }
}

async function deleteGuide(id) {
    if (confirm('确定要删除这个操作指引吗？')) {
        await apiRequest(`/operation-guides/${id}`, 'DELETE');
        loadGuides();
    }
}

async function deleteFaq(id) {
    if (confirm('确定要删除这个问答吗？')) {
        await apiRequest(`/faq/${id}`, 'DELETE');
        loadFaq();
    }
}

window.onclick = function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    loadTabData('channels');
});
