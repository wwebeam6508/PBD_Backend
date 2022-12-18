function getOffset (currentPage = 1, listPerPage) {
  return (currentPage - 1) * [listPerPage]
}

function emptyOrRows (rows) {
  if (!rows) {
    return []
  }
  return rows
}

function pageArray (totalSize,pageSize,page, maxLength) {
  const currentPage = Number(page)
  const current_position = Math.floor(maxLength/2)
  const totalPage = Math.ceil(totalSize/pageSize)

  const startPoint = currentPage - current_position >= 1 ? currentPage - current_position : 1
  const endPoint = currentPage + current_position <= totalPage ? currentPage + current_position : totalPage
  let pages = []
  if(startPoint !== 1){
      pages.push("...")
  }
  for (let i = startPoint; i <= endPoint; i++) {
      pages.push(i)
  }
  if(endPoint !== totalPage){
      pages.push("...")
  }
  return pages
}

export {
  pageArray,
  getOffset,
  emptyOrRows
}
