
// ========== SCRIPT.JS: a lógica do Esfomeado ==========
// $ = atalho para document.querySelector (pega um elemento da página pelo seletor CSS).
const $=s=>document.querySelector(s);
// brl = formata um número como moeda brasileira (ex.: 18.9 vira R$ 18,90).
const brl=v=>v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
// cats = lista de categorias [nome, emoji] usada na lateral e nos chips.
const cats=[["Todos","🍽️"],["Hambúrguer","🍔"],["Pizza","🍕"],["Japonesa","🍣"],["Marmita","🍛"],["Açaí","🫐"],["Salgados","🥟"],["Massas","🍝"],["Doces","🍫"]];
// F = lista de filtros [código, texto, emoji]: frete grátis, melhor avaliados, mais rápidos e abertos agora.
const F=[["free","Entrega grátis","🛵"],["rate","Melhor avaliados","⭐"],["fast","Mais rápidos","⏱️"],["open","Abertos agora","🟢"]];
// R = os dados dos 8 restaurantes fictícios.
// Campos: id, n (nome), c (categoria), r (nota), v (nº de avaliações), t (tempo de entrega),
// f (frete), b (selo), d (descrição) e m (cardápio: [nome, preço, emoji, descrição]).
const R=[{id:1,n:"Sushi Kaze",c:"Japonesa",r:4.9,v:2105,t:"40–55 min",f:8.99,b:"Melhor avaliado",d:"Sushi, sashimi e temaki fresquinhos",m:[["Combo 20 peças",69.9,"🍣","Mix de uramaki, niguiri e sashimi"],["Temaki de Salmão",32,"🌯","Salmão, cream cheese e cebolinha"],["Gyoza (6 un.)",24,"🥟","Pastelzinho grelhado de carne"]]},{id:2,n:"Doce Encanto",c:"Doces",r:4.9,v:1330,t:"25–35 min",f:0,b:"Entrega grátis",d:"Bolos, brigadeiros e sobremesas",m:[["Fatia de Bolo de Chocolate",18.9,"🍰","Camadas de brigadeiro com morango"],["Caixa com 6 brigadeiros",34,"🍫","Tradicional, ninho, pistache e mais"],["Cookie Recheado",12.5,"🍪","Chocolate meio amargo e nutella"]]},{id:3,n:"Brasa Burger",c:"Hambúrguer",r:4.8,v:1240,t:"25–35 min",f:5.99,b:"Mais pedido",d:"Hambúrgueres artesanais na brasa",m:[["Smash Duplo",32.9,"🍔","Dois blends de 90 g, cheddar e molho da casa"],["Batata Rústica",18,"🍟","Porção crocante com alecrim"],["Milkshake de Ovomaltine",19.9,"🥤","400 ml bem cremoso"]]},{id:4,n:"Açaí do Norte",c:"Açaí",r:4.8,v:1710,t:"15–25 min",f:0,b:"Entrega grátis",d:"Açaí na tigela do jeito que você montar",m:[["Tigela 500 ml",22.9,"🫐","Com granola, banana e leite condensado"],["Tigela 700 ml",29.9,"🫐","Para quem está esfomeado de verdade"],["Vitamina de Açaí",16,"🥤","Batida com guaraná em pó"]]},{id:5,n:"Forno di Napoli",c:"Pizza",r:4.7,v:980,t:"30–45 min",f:0,b:"Entrega grátis",d:"Massa de fermentação lenta, forno a lenha",m:[["Margherita",49.9,"🍕","Molho de tomate, muçarela e manjericão"],["Calabresa Acebolada",54.9,"🍕","Calabresa artesanal e cebola roxa"],["Guaraná 2 L",12,"🥤","Bem gelado"]]},{id:6,n:"Cantina Bella",c:"Massas",r:4.7,v:860,t:"35–50 min",f:6.99,b:null,d:"Massas frescas e molhos caseiros",m:[["Fettuccine ao Alfredo",42.9,"🍝","Molho cremoso de queijo parmesão"],["Lasanha à Bolonhesa",46.9,"🍝","Porção individual gratinada"],["Nhoque ao Sugo",38.5,"🍅","Molho de tomate fresco e manjericão"]]},{id:7,n:"Tempero da Vó",c:"Marmita",r:4.8,v:645,t:"20–30 min",f:3.99,b:null,d:"Comida caseira feita todo dia",m:[["Prato Feito Completo",28.9,"🍛","Arroz, feijão, carne, farofa e salada"],["Strogonoff de Frango",31.5,"🍲","Com arroz e batata palha"],["Suco de Maracujá",9,"🧃","Copo de 500 ml"]]},{id:8,n:"Pastelaria do Zé",c:"Salgados",r:4.5,v:420,t:"20–30 min",f:4.99,b:null,d:"Pastéis e coxinhas na hora",m:[["Combo 6 coxinhas",22.9,"🍗","Frango cremoso com catupiry"],["Pastel de Carne",12.5,"🥟","Grande e bem crocante"],["Caldo de Cana",8,"🥤","Gelado, 400 ml"]]}];
// ls = ajudante do localStorage: get lê e set grava valores (com prefixo "esf_"), sem quebrar se o navegador bloquear o armazenamento.
const ls={get(k,d){try{const v=JSON.parse(localStorage.getItem("esf_"+k));return v==null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem("esf_"+k,JSON.stringify(v))}catch(e){}}};
// esc = escapa caracteres especiais do HTML (&, <, >, aspas) para que texto digitado pelo usuário não vire código na página.
const esc=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
// nm = normaliza texto: tira acentos e põe em minúsculas, para a busca ignorar acento e maiúscula.
const nm=t=>t.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
// Estado do app (variáveis globais):
// cat = categoria escolhida; q = texto da busca; fl = filtro ativo; cur = restaurante aberto (null = tela inicial);
// addr = endereço; cart = sacola {rid, items}; coupon = cupom aplicado; tt = timer do aviso (toast);
// note = observações do pedido; tip = gorjeta; pay = forma de pagamento; troco = troco para quanto;
// orders = histórico de pedidos; shown = número do pedido que está aberto no painel.
let cat="Todos",q="",fl="",cur=null,addr=ls.get("addr",""),cart=ls.get("cart",{rid:null,items:{}}),coupon=false,tt,note="",tip=0,pay="Pix",troco="",orders=ls.get("orders",[]),shown=0;
// HR = horários especiais [abre, fecha] por id de restaurante (os demais usam 10h às 23h).
// OUT = itens esgotados, no formato "idRestaurante-indiceDoItem".
const HR={5:[18,23],6:[11,23]},OUT={"3-1":1};
// hrs = devolve o horário de funcionamento [abre, fecha] de um restaurante.
const hrs=r=>HR[r.id]||[10,23];
// isOpen = diz se o restaurante está aberto agora, comparando a hora atual com o horário dele.
const isOpen=r=>{const h=new Date().getHours(),[a,b]=hrs(r);return h>=a&&h<b};
// btn = gera o botão "+" de um item do cardápio; mostra "Esgotado" se o item acabou e nada se o restaurante está fechado.
const btn=(r,i)=>OUT[r.id+"-"+i]?'<span class="out">Esgotado</span>':isOpen(r)?`<button class="plus" onclick="add(${i})" aria-label="Adicionar ${r.m[i][0]}">+</button>`:"";
// save = grava sacola, endereço e pedidos no localStorage (para não perder ao recarregar a página).
function save(){ls.set("cart",cart);ls.set("addr",addr);ls.set("orders",orders)}

// Atalho de teclado: a tecla Esc fecha o painel deslizante (sacola, login, endereço...).
addEventListener("keydown",e=>{if(e.key=="Escape")closeCart()});
// PS = posições e tamanhos de recorte da imagem do restaurante, usados para dar "cara diferente" à foto de cada prato.
const PS=[["100% 100%","200% auto"],["0% 100%","300% auto"],["100% 0%","250% auto"]];
// rr = devolve o restaurante da sacola atual.
const rr=()=>R.find(r=>r.id==cart.rid);
// cnt = conta quantos itens há na sacola.
const cnt=()=>Object.values(cart.items).reduce((a,b)=>a+b,0);
// sub = calcula o subtotal da sacola (preço x quantidade de cada item).
const sub=()=>Object.entries(cart.items).reduce((s,[i,n])=>s+rr().m[i][1]*n,0);
// km = distância fictícia até o restaurante, calculada a partir do id.
const km=r=>(0.6+r.id*0.5).toFixed(1).replace(".",",");
// mn = pedido mínimo do restaurante (valor fictício calculado a partir do id).
const mn=r=>20+(r.id%3)*5;
// nt = formata a nota com vírgula (ex.: 4.9 vira 4,9).
const nt=v=>v.toFixed(1).replace(".",",");
// frete = texto do frete: o valor em reais ou "Grátis".
const frete=r=>r.f?brl(r.f):'<span class="ok">Grátis</span>';
// toast = mostra um aviso rápido na parte de baixo da tela e some depois de 1,9 segundo.
function toast(m){const e=$("#toast");e.textContent=m;e.className="show";clearTimeout(tt);tt=setTimeout(()=>e.className="",1900)}

// go = volta para a tela inicial e rola a página para o topo.
function go(){cur=null;draw();scrollTo(0,0)}

// showR = abre a página (cardápio) do restaurante escolhido.
function showR(id){cur=R.find(r=>r.id==id);draw();scrollTo(0,0)}

// srch = chamada a cada letra digitada na busca; guarda o texto e atualiza a lista (ou volta para a home).
function srch(v){q=v;if(cur){cur=null;draw()}else list()}

// tg = liga ou desliga um filtro (clicar de novo no mesmo filtro remove ele).
function tg(k){fl=fl==k?"":k;list()}

// draw = desenha a tela certa: o cardápio se há restaurante aberto, senão a home com a lista; depois atualiza a sacola.
function draw(){$("#wrap").classList.toggle("full",!!cur);if(cur)menu();else{home();list()}upd()}

// home = monta o HTML da tela inicial: banner (hero), categorias, filtros e a grade de restaurantes.
function home(){$("#app").innerHTML=`<section class="hero"><div class="hc"><span class="pill">Entrega em 25–35 min</span><h1>Fome de quê?</h1><p>Bateu a fome? Bora resolver. Os melhores restaurantes da sua região, entregues quentinhos na sua porta.</p><div class="hch"><button onclick="toast('ESFOMEADO10: 10% off, máx. R$ 15, em pedidos a partir de R$ 30')">Cupom ESFOMEADO10</button><button onclick="fl='free';list()">Frete grátis</button><button onclick="fl='open';list()">Abertos agora</button></div></div></section><div class="pills" id="ct"></div><div class="fl" id="fl"></div><h2>Perto de você</h2><div class="mute" id="cn"></div><div class="grid" id="gr"></div>`;}

// card = gera o HTML do cartão de um restaurante (foto, selo, nota, tempo, frete) na lista.
const card=r=>`<article class="rcard" tabindex="0" onkeydown="if(event.key==='Enter')showR(${r.id})" onclick="showR(${r.id})"><div class="pic i${r.id}${isOpen(r)?"":" off"}">${!isOpen(r)?`<span class="bdg">Fechado · abre às ${hrs(r)[0]}h</span>`:r.b?`<span class="bdg${r.b=="Entrega grátis"?" g":""}">${r.b}</span>`:""}</div><div class="cb"><div class="avt">${r.n[0]}</div><div class="r1"><b>${r.n}</b><span class="rt">★ ${nt(r.r)}</span></div><div class="mute">${r.c} · ${r.v} avaliações</div><div class="r1 r2"><span class="mute">${r.t} · mín ${brl(mn(r))}</span>${r.f?`<b>${brl(r.f)}</b>`:`<span class="ok">Entrega grátis</span>`}</div></div></article>`;
// list = monta a lateral (categorias e filtros), aplica busca, categoria e filtros aos restaurantes
// e desenha os cartões; também ordena por nota ou tempo e mostra a contagem de resultados.
function list(){$("#sb").innerHTML=`<div class="box"><h3>Categorias</h3>${cats.map(([c,e])=>`<button class="si${c==cat?" on":""}" onclick="cat='${c}';list()">${e} ${c}</button>`).join("")}</div><div class="box"><h3>Filtros</h3>${F.map(([k,l,e])=>`<button class="si${fl==k?" on":""}" onclick="tg('${k}')">${e} ${l}</button>`).join("")}</div>`;$("#ct").innerHTML=cats.map(([c,e])=>`<button class="chip${c==cat?" on":""}" onclick="cat='${c}';list()">${e} ${c}</button>`).join("");$("#fl").innerHTML=F.map(([k,l])=>`<button class="chip${fl==k?" on":""}" onclick="tg('${k}')">${l}</button>`).join("");const k=nm(q.trim());const l=R.filter(r=>(cat=="Todos"||r.c==cat)&&(!k||nm(r.n+r.c+r.m.map(x=>x[0]).join(" ")).includes(k))&&(fl!="free"||!r.f)&&(fl!="open"||isOpen(r)));if(fl=="rate")l.sort((a,b)=>b.r-a.r);if(fl=="fast")l.sort((a,b)=>parseInt(a.t)-parseInt(b.t));$("#cn").textContent=`${l.length} ${l.length==1?"restaurante entregando":"restaurantes entregando"} agora`;$("#gr").innerHTML=l.length?l.map(card).join(""):`<p class="mute">Nenhum restaurante encontrado. Tente outro prato ou categoria.</p><button class="bo" onclick="q='';fl='';cat='Todos';$('#si').value='';list()">Limpar filtros</button>`;}

// menu = monta a página do restaurante: capa, informações, destaques e cardápio completo.
function menu(){const r=cur,ph=(i,c)=>`<div class="ph ${c} i${r.id}" style="background-position:${PS[i][0]};background-size:${PS[i][1]}">${btn(r,i)}</div>`;$("#app").innerHTML=`<div class="cv i${r.id}"><button class="bk" onclick="go()" aria-label="Voltar">←</button></div><section class="rc"><div class="lg big">${r.n[0]}</div><h1>${r.n}</h1><div class="mute">${r.d}</div><div class="inf">Entrega rastreável · ${km(r)} km · Mín ${brl(mn(r))}</div><div class="inf">⭐ ${nt(r.r)} (${r.v} avaliações) · ${r.c}</div><div class="inf">Padrão · ${r.t} · ${frete(r)}</div><div class="club">🧾 Preço claro: sem taxa de serviço e sem taxa dinâmica. O frete aparece antes de você pedir.</div>${isOpen(r)?"":`<div class="club warn">⏰ Fechado agora, abre às ${hrs(r)[0]}h. Dá para ver o cardápio, mas não para pedir.</div>`}<h2>Destaques</h2><div class="hs">${r.m.slice(0,2).map((m,i)=>`<div class="dc">${ph(i,"")}<b class="price">${brl(m[1])}</b><div>${m[0]}</div></div>`).join("")}</div><h2>Cardápio</h2>${r.m.map((m,i)=>`<div class="item"><div class="grow"><b>${m[0]}</b><div class="mute">${m[3]}</div><b class="price">${brl(m[1])}</b></div>${ph(i,"sm")}</div>`).join("")}</section>`;}

// add = adiciona o item i do cardápio à sacola. Bloqueia se estiver fechado ou esgotado
// e, se a sacola for de outro restaurante, pergunta se quer trocar (só dá para pedir de um restaurante por vez).
function add(i,ok){if(!isOpen(cur)||OUT[cur.id+"-"+i])return;if(cart.rid&&cart.rid!==cur.id&&!ok){show(`<h2>Trocar de restaurante?</h2><p class="mute">Sua sacola tem itens de ${esc(rr().n)}. Só dá para pedir de um restaurante por vez. Esvaziar a sacola e começar este pedido?</p><button class="cta" onclick="closeCart();add(${i},1)">Sim, trocar</button><button class="cta sec" onclick="closeCart()">Manter minha sacola</button>`);return}
if(cart.rid!==cur.id)cart={rid:cur.id,items:{}};cart.items[i]=(cart.items[i]||0)+1;upd();toast("Adicionado à sacola");}

// chg = muda a quantidade do item i na sacola (d = +1 ou -1); remove o item se chegar a zero e esvazia a sacola se não sobrar nada.
function chg(i,d){cart.items[i]+=d;if(cart.items[i]<=0)delete cart.items[i];if(!cnt())cart={rid:null,items:{}};upd();sheet();}

// upd = atualiza a interface: contador do carrinho, endereço no topo e a barra fixa da sacola; também salva os dados.
function upd(){save();const n=cnt();$("#cc").textContent=n;$("#ad").textContent=addr||"Escolher endereço";const b=$("#bar");b.hidden=!n;b.innerHTML=n?`<span>🛒 ${n} ${n>1?"itens":"item"} · ${rr().n}</span><span>Ver sacola · ${brl(sub())}</span>`:"";}

// show = coloca o HTML recebido dentro do painel deslizante e abre o painel.
function show(h){shown=0;$("#sheet").innerHTML=h;$("#ov").hidden=false}

// openCart = abre o painel com o conteúdo da sacola.
function openCart(){shown=0;$("#ov").hidden=false;sheet()}

// closeCart = fecha o painel deslizante.
function closeCart(){shown=0;$("#ov").hidden=true}

// login = abre o painel "Entrar ou cadastrar" e valida se o e-mail digitado tem formato válido.
function login(){show(`<h2>Entrar ou cadastrar</h2><p class="mute">Entrar é opcional: você pode pedir como convidado.</p><div class="cp"><input id="em" type="email" aria-label="E-mail" placeholder="email@email.com.br"></div><button class="cta" onclick="if(/^\S+@\S+\.\S+$/.test($('#em').value.trim())){closeCart();toast('Bem-vindo ao Esfomeado!')}else toast('Digite um e-mail válido')">Continuar</button>`)}

// addrSheet = abre o painel para informar o endereço de entrega e confirma o que foi digitado.
function addrSheet(){show(`<h2>Onde vamos entregar?</h2><div class="cp"><input id="ai" value="${esc(addr)}" placeholder="Rua, número, bairro" autocomplete="street-address"></div><button class="cta" onclick="addr=$('#ai').value||addr;upd();closeCart()">Confirmar endereço</button>`)}

// cup = valida o cupom digitado: ESFOMEADO10 dá 10% de desconto (máx. R$ 15) em pedidos a partir de R$ 30.
function cup(){const v=$("#cp").value.trim().toUpperCase();if(v=="ESFOMEADO10"){coupon=true;toast(sub()<30?"Cupom guardado: vale a partir de R$ 30,00":"Cupom aplicado: 10% de desconto")}
else if(v)toast("Cupom inválido. Confira o código");sheet();}

// sheet = desenha o conteúdo da sacola: itens com + e -, pedido mínimo, observações, cupom, gorjeta,
// subtotal, desconto, frete, total, forma de pagamento e o botão "Finalizar pedido".
function sheet(){const s=$("#sheet");if(!cnt()){s.innerHTML=`<h2>Sua sacola</h2><p class="mute">Está vazia. Escolha um restaurante e monte seu pedido.</p><button class="cta" onclick="closeCart();go()">Ver restaurantes</button>`;return}
const r=rr(),sb=sub(),mi=mn(r),falta=mi-sb,open=isOpen(r),d=coupon&&sb>=30?Math.min(sb*.1,15):0,tot=sb-d+r.f+tip;s.innerHTML=`<h2>Sua sacola</h2><div class="mute">${esc(r.n)} · 📍 ${esc(addr)||"Escolher endereço"}</div>${Object.entries(cart.items).map(([i,n])=>`<div class="line"><span>${r.m[i][2]} ${r.m[i][0]}</span><span class="qty"><button aria-label="Remover um ${r.m[i][0]}" onclick="chg(${i},-1)">−</button>${n}<button aria-label="Adicionar mais um ${r.m[i][0]}" onclick="chg(${i},1)">+</button></span><b>${brl(r.m[i][1]*n)}</b></div>`).join("")}${open?"":`<div class="warn">${esc(r.n)} está fechado agora (abre às ${hrs(r)[0]}h).</div>`}${falta>0?`<div class="warn">Faltam ${brl(falta)} para o pedido mínimo de ${brl(mi)}.</div><div class="prog"><i style="width:${Math.max(5,sb/mi*100)}%"></i></div>`:""}<textarea id="obs" rows="2" maxlength="200" aria-label="Observações do pedido" placeholder="Observações (ex.: sem cebola, alergia a amendoim)" oninput="note=this.value">${esc(note)}</textarea>${coupon?`<div class="row ok"><span>Cupom ESFOMEADO10 aplicado</span><button class="bo" onclick="coupon=false;sheet()">Remover</button></div>`:`<div class="cp"><input id="cp" aria-label="Cupom" placeholder="Cupom (tente ESFOMEADO10)"><button onclick="cup()">Aplicar</button></div>`}<div class="mute sm">ESFOMEADO10: 10% de desconto, máx. R$ 15, em pedidos a partir de R$ 30.</div>${coupon&&sb<30?`<div class="warn">O cupom precisa de um pedido a partir de R$ 30,00.</div>`:""}<div class="mute" style="margin-top:10px">Gorjeta para o entregador (opcional, 100% dele)</div><div class="tips">${[0,2,5,8].map(v=>`<button class="chip${tip==v?" on":""}" onclick="tip=${v};sheet()">${v?brl(v):"Sem gorjeta"}</button>`).join("")}</div><div class="row"><span>Subtotal</span><span>${brl(sb)}</span></div>${d?`<div class="row ok"><span>Desconto</span><span>− ${brl(d)}</span></div>`:""}<div class="row"><span>Entrega</span><span>${r.f?brl(r.f):"Grátis"}</span></div><div class="row"><span>Taxa de serviço</span><span class="ok">Não cobramos</span></div>${tip?`<div class="row"><span>Gorjeta</span><span>${brl(tip)}</span></div>`:""}<div class="row tot"><span>Total</span><span>${brl(tot)}</span></div><label class="mute" for="pay">Pagamento</label><select id="pay" onchange="pay=this.value;sheet()">${["Pix","Cartão de crédito","Dinheiro na entrega"].map(p=>`<option${p==pay?" selected":""}>${p}</option>`).join("")}</select>${pay=="Dinheiro na entrega"?`<div class="cp"><input aria-label="Troco" inputmode="decimal" placeholder="Troco para quanto? (opcional)" value="${esc(troco)}" oninput="troco=this.value"></div>`:""}<div class="mute sm">Você pode cancelar sem custo até o restaurante começar a preparar. Reembolso imediato.</div><button class="cta" ${falta>0||!open?"disabled":""} onclick="finish()">Finalizar pedido · ${brl(tot)}</button>`;}

// STP e ICN = etapas do pedido (recebido, preparando, saiu para entrega, entregue) e os emojis de cada etapa.
const STP=["Pedido recebido","Preparando com carinho","Saiu para entrega","Entregue. Bom apetite!"],ICN=["✅","👨‍🍳","🛵","🎉"];
// finish = finaliza o pedido: confere endereço, horário e pedido mínimo, calcula o total,
// cria o pedido no histórico, esvazia a sacola e inicia o rastreio simulado.
function finish(){if(!addr){addrSheet();toast("Informe o endereço de entrega");return}
const r=rr(),sb=sub();if(!r||!isOpen(r)||sb<mn(r))return;const d=coupon&&sb>=30?Math.min(sb*.1,15):0,tot=sb-d+r.f+tip;const o={num:Math.floor(1000+Math.random()*9000),rid:r.id,rn:r.n,items:{...cart.items},tot,k:0,st:"Pedido recebido",obs:note,dt:new Date().toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"})};orders.unshift(o);orders=orders.slice(0,20);cart={rid:null,items:{}};coupon=false;note="";tip=0;troco="";upd();tview(o);setTimeout(()=>track(o.num,1),4000);}

// track = simula o andamento do pedido: a cada 4 segundos avança para a próxima etapa e salva; para se o pedido foi cancelado.
function track(num,k){const o=orders.find(x=>x.num==num);if(!o||o.st=="Cancelado")return;o.k=k;o.st=k<3?STP[k]:"Entregue";save();if(shown==num&&!$("#ov").hidden)tview(o);if(k<3)setTimeout(()=>track(num,k+1),4000);}

// tview = mostra a tela de rastreio do pedido (etapas, previsão, avaliação com estrelas, cancelar e ajuda).
function tview(o){const r=R.find(x=>x.id==o.rid),k=o.k,mx=parseInt(r.t.split("–")[1])+10;show(`<h2>Pedido #${o.num}</h2><div class="mute">${esc(r.n)} · previsão ${r.t}. Passou de ${mx} min? Você ganha R$ 10 de crédito automático.</div><ol class="trk">${STP.map((x,j)=>`<li class="${j<=k?"done":""}">${ICN[j]} ${x}</li>`).join("")}</ol>${k==3?`<div class="mute">Como foi? <span class="stars">${[1,2,3,4,5].map(n=>`<button aria-label="${n} estrelas" onclick="toast('Obrigado! Você deu ${n} estrelas')">★</button>`).join("")}</span></div>`:""}${k<2?`<button class="cta sec" onclick="cancelOrder(${o.num})">Cancelar sem custo</button>`:""}<button class="cta sec" onclick="help(${o.num})">Preciso de ajuda</button><button class="cta" onclick="closeCart();go()">Voltar ao início</button>`);shown=o.num;}

// cancelOrder = cancela o pedido sem custo (só até antes de sair para entrega) e mostra a confirmação.
function cancelOrder(num){const o=orders.find(x=>x.num==num);if(!o||o.k>=2)return;o.st="Cancelado";save();show(`<h2>Pedido #${num} cancelado</h2><p class="mute">Sem custo. O reembolso volta na hora para a mesma forma de pagamento.</p><button class="cta" onclick="closeCart()">Ok</button>`);}

// help = abre as opções de ajuda sobre o pedido (atraso, item errado, cobrança, outro).
function help(num){show(`<h2>Ajuda com o pedido #${num}</h2><p class="mute">Escolha o problema. Você fala direto com uma pessoa, sem menu de robô.</p>${["Pedido atrasado","Item faltando ou errado","Cobrança diferente do combinado","Outro problema"].map(t=>`<button class="si" onclick="toast('Atendente chamado: ${t}')">💬 ${t}</button>`).join("")}<button class="cta sec" onclick="tview(orders.find(x=>x.num==${num}))">Voltar</button>`);}

// ordersSheet = lista o histórico de pedidos (os últimos 20) com o botão "Pedir de novo".
function ordersSheet(){show(`<h2>Meus pedidos</h2>${orders.length?orders.map((o,j)=>`<div class="line"><span><b>#${o.num} · ${esc(o.rn)}</b><br><span class="mute">${o.dt} · ${brl(o.tot)} · ${o.st}</span></span><button class="bo" onclick="reorder(${j})">Pedir de novo</button></div>`).join(""):'<p class="mute">Você ainda não fez pedidos.</p>'}<button class="cta sec" onclick="closeCart()">Fechar</button>`);}

// reorder = refaz um pedido antigo: copia os itens para a sacola, ignorando os esgotados, e abre a sacola.
function reorder(j){const o=orders[j],r=R.find(x=>x.id==o.rid);if(!isOpen(r)){toast(r.n+" está fechado agora");return}
const it=Object.fromEntries(Object.entries(o.items).filter(([i])=>!OUT[o.rid+"-"+i]));if(!Object.keys(it).length){toast("Os itens deste pedido estão esgotados");return}
cart={rid:o.rid,items:it};upd();openCart();}

// Ao carregar a página: retoma o rastreio de pedidos que ainda estavam em andamento e desenha a tela inicial.
orders.forEach(o=>{if(o.k<3&&o.st!="Cancelado")track(o.num,o.k)});draw();

// ---------- Tema claro/escuro ----------
// thRoot = elemento <html>; thMq = preferência de tema do sistema; thEff = tema em uso agora.
const thRoot=document.documentElement,thMq=matchMedia("(prefers-color-scheme:dark)"),thEff=()=>thRoot.dataset.theme||(thMq.matches?"dark":"light");

// thIcon = atualiza o ícone (sol ou lua) e o texto do botão de tema.
function thIcon(){const b=$("#th"),d=thEff()=="dark",t=d?"Mudar para modo claro":"Mudar para modo escuro";b.textContent=d?"☀️":"🌙";b.setAttribute("aria-label",t);b.title=t}

// setTheme = alterna entre claro e escuro, com animação suave, e salva a escolha.
let thT;function setTheme(){const n=thEff()=="dark"?"light":"dark";thRoot.classList.add("tt");thRoot.dataset.theme=n;ls.set("theme",n);thIcon();clearTimeout(thT);thT=setTimeout(()=>thRoot.classList.remove("tt"),600)}

// Se o tema do sistema mudar, atualiza o ícone do botão.
thMq.addEventListener("change",thIcon);thIcon();