function getChats() { return readJSON("creovaChats", []); }
function saveChats(list) { localStorage.setItem("creovaChats", JSON.stringify(list)); }

// opens (or creates) the conversation between this buyer and a seller
function startChat(me, seller, sellerName) {
  const id = me.contact + "|" + seller;
  const list = getChats();
  if (!list.some(function (c) { return c.id === id; })) {
    list.push({
      id: id, buyer: me.contact, buyerName: me.name,
      seller: seller, sellerName: sellerName,
      messages: [], unreadBuyer: 0, unreadSeller: 0, updated: Date.now()
    });
    saveChats(list);
  }
  return id;
}

function unreadFor(contact) {
  let n = 0;
  getChats().forEach(function (c) {
    if (c.seller === contact) n += c.unreadSeller || 0;
    if (c.buyer === contact) n += c.unreadBuyer || 0;
  });
  return n;
}