(async function(){
    if (typeof game_data === 'undefined' || game_data.screen !== 'am_farm') {
        UI.InfoMessage("Redirecionando...", 2000);
        location.href = game_data.link_base_pure + 'am_farm';
        return;
    }

    const allCoords = new Set();
    const $widget = $('#am_widget_Farm');
    
    // Melhoria: busca apenas o número da última página
    const navLinks = $widget.find('.paged-nav-item');
    const maxPages = navLinks.length > 0 ? parseInt(navLinks.last().text().replace(/[^\d]/g, '')) : 1;

    Dialog.show('progress_dialog', `
        <div style="padding:15px; text-align:center;">
            <p><b>Extraindo coordenadas...</b></p>
            <div id="coord_progress" style="width:250px; height:20px; background:#ddd; margin:10px auto; border:1px solid #999;">
                <div id="pb_inner" style="background:#92c200; width:0%; height:100%;"></div>
            </div>
            <span id="label_prog">0/${maxPages}</span>
        </div>
    `);

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const extract = ($doc) => {
        $doc.find("#plunder_list tbody tr").each(function() {
            const cols = $(this).find("td");
            if(cols.length > 3){
                const match = cols.eq(3).text().match(/(\d{1,3}\|\d{1,3})/);
                if(match) allCoords.add(match[0]);
            }
        });
    };

    for(let i = 0; i < maxPages; i++){
        if(i === 0) {
            extract($(document));
        } else {
            await sleep(800); // Aumentei um pouco para evitar bloqueio
            try {
                // A URL precisa ser construída cuidadosamente
                const url = window.location.href.split('&Farm_page=')[0] + "&Farm_page=" + i;
                const html = await $.get(url);
                extract($(html));
            } catch(e) { console.error("Falha ao carregar página " + i); }
        }
        
        // Atualização manual da barra
        const percent = ((i + 1) / maxPages) * 100;
        $('#pb_inner').css('width', percent + '%');
        $('#label_prog').text((i + 1) + '/' + maxPages);
    }

    // Modal de finalização mantido igual, mas com aviso:
    // O restante do seu código para criar o modal está correto.
})();
