const confirmDelete = (event) => {
  event.preventDefault();

  const shouldDelete = confirm(
    "¿Estás seguro de que deseas eliminar este elemento?"
  );
  if (shouldDelete) {
    const form = event.target.closest("form");
    form.submit();
  }
};
