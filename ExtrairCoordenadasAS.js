(async function() {
    // 1. Safety redirect to the correct screen (Loot Assistant)
    if (typeof game_data === 'undefined' || game_data.screen !== 'am_farm') {
        UI.InfoMessage("Redirecting to Loot Assistant...", 2000);
        location.href = game_data.link_base_pure + 'am_farm';
        return;
    }

    const allCoords = new Set();
    const $widget = $('#am_widget_Farm');
    
    // Identify the total number of pages
    const navLinks = $widget.find('#plunder_list_nav .paged-nav-item');
    const maxPages = navLinks.length > 0 ? parseInt(navLinks.last().text().match(/\d+/g).pop()) : 1;

    // 2. Persistent loading bar
    Dialog.show('progress_dialog', `
        <div style="padding:15px; text-align:center;">
            <p><b>Extracting coordinates...</b></p>
            <div id="coord_progress" class="progress-bar live-progress-bar progress-bar-alive" style="width:250px; margin:10px auto;">
                <div style="background: rgb(146, 194, 0); width: 0%;"></div>
                <span class="label">0/${maxPages}</span>
            </div>
        </div>
    `);

    const $pb = $('#coord_progress');
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Coordinate extraction function
    const extract = ($doc) => {
        $doc.find("#plunder_list tbody tr").each(function() {
            const cols = $(this).find("td");
            if(cols.length > 3){
                const match = cols.eq(3).text().match(/(\d{1,3}\|\d{1,3})/);
                if(match) allCoords.add(match[0]);
            }
        });
    };

    // 3. Process requests
    for(let i = 0; i < maxPages; i++){
        if(i === 0) {
            extract($(document));
        } else {
            await sleep(Math.floor(Math.random() * 800) + 400);
            try {
                const html = await $.get(window.location.href.split('&Farm_page=')[0] + "&Farm_page=" + i);
                extract($(html));
            } catch(e) { console.error("Error on page " + i); }
        }
        
        UI.updateProgressBar($pb, i + 1, maxPages);
        $pb.find('.label').text((i + 1) + '/' + maxPages);
    }

    Dialog.close();

    // 4. Final result modal
    const coordsArray = Array.from(allCoords);
    const modal = document.createElement("div");
    modal.className = "vis";
    modal.style = "position:fixed;top:10%;left:35%;width:400px;background:#e3d3b3;border:2px solid #603000;z-index:999999;padding:2px;box-shadow: 0 0 10px #000;";
    
    modal.innerHTML = `
        <h3 style="background:#c1a264;margin:0;padding:5px;border-bottom:1px solid #603000;text-align:center;font-size:14px;color:#3d1f00;">Extraction Complete</h3>
        <div style="padding:10px;text-align:center;color:#3d1f00;font-family:Verdana,Arial;">
            <p>Processed: <b>${maxPages}</b> page(s)<br>
            Total unique: <b style="color: #603000;">${coordsArray.length}</b> coordinates</p>
            <textarea id="list" style="width:95%;height:200px;background:#fff5da;border:1px solid #603000;padding:5px;font-family:monospace;font-size:12px;">${coordsArray.join("\n")}</textarea>
            <div style="margin-top:10px;">
                <button id="copyBtn" class="btn">Copy List</button>
                <button id="closeBtn" class="btn">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById("copyBtn").onclick = () => {
        document.getElementById("list").select();
        document.execCommand("copy");
        alert("Copied to clipboard!");
    };
    document.getElementById("closeBtn").onclick = () => modal.remove();
})();

// Licença: MIT
// Copyright (c) agressor89

// Aviso Legal:
// Ao enviar um mod (script) gerado pelo utilizador para utilização com o Tribal Wars,
// o criador concede à InnoGames uma licença perpétua, irrevogável, mundial,
// isenta de royalties e não exclusiva para utilizar, reproduzir, distribuir,
// exibir publicamente, modificar e criar trabalhos derivados do mod.
//
// Esta licença permite à InnoGames incorporar o mod em qualquer aspecto do jogo
// e dos seus serviços relacionados, incluindo actividades promocionais e comerciais,
// sem qualquer exigência de compensação ou atribuição ao uploader.
//
// O Uploader declara e garante que tem o direito legal de conceder esta licença
// e que o mod não infringe quaisquer direitos de terceiros.
