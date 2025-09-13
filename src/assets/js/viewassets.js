let currentAsset = null;
    const listSection = document.getElementById("assets-list-section");
    const detailSection = document.getElementById("asset-detail-section");
    const detailForm = document.getElementById("asset-detail-form");
    const formTitle = document.getElementById("asset-form-title");
    const formActions = document.getElementById("asset-form-actions");

    async function loadAssets() {
      try {
        const res = await apiFetch("/api/assets");
        if (!res.ok) throw new Error("Failed to load assets");
        const assets = await res.json();
        renderTable(assets);
      } catch (err) {
        console.error(err);
        document.getElementById("asset-table-body").innerHTML =
          `<tr><td colspan="10" style="text-align:center;color:red;">Error loading assets</td></tr>`;
      }
    }

    async function searchAssets() {
      const tag = document.getElementById("filter-tag").value.trim();
      const serial = document.getElementById("filter-serial").value.trim();
      const type = document.getElementById("filter-type").value;
      const location = document.getElementById("filter-location").value.trim();
      const params = new URLSearchParams();
      if (tag) params.append("asset_tag", tag);
      if (serial) params.append("serial_number", serial);
      if (type) params.append("asset_type", type);
      if (location) params.append("location", location);
      try {
        const res = await apiFetch(`/api/assets/search?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to search assets");
        const assets = await res.json();
        renderTable(assets);
      } catch (err) {
        console.error(err);
        document.getElementById("asset-table-body").innerHTML =
          `<tr><td colspan="10" style="text-align:center;color:red;">Error searching assets</td></tr>`;
      }
    }

    function renderTable(assets) {
      const body = document.getElementById("asset-table-body");
      body.innerHTML = "";
      if (!assets || assets.length === 0) {
        body.innerHTML = `<tr><td colspan="10" style="text-align:center;color:#888;">No assets found</td></tr>`;
        return;
      }
      assets.forEach(asset => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${asset.id}</td><td>${asset.asset_tag}</td><td>${asset.asset_type}</td>
          <td>${asset.manufacturer||""}</td><td>${asset.model||""}</td>
          <td>${asset.serial_number||""}</td><td>${asset.status||""}</td>
          <td>${asset.location||""}</td><td>${asset.purchase_date||""}</td>
          <td>
            <button class="btn btn-view" data-id="${asset.id}">View</button>
            <button class="btn btn-edit" data-id="${asset.id}">Edit</button>
            <button class="btn btn-delete" data-id="${asset.id}">Delete</button>
          </td>
        `;
        body.appendChild(tr);
      });

      document.querySelectorAll(".btn-view").forEach(btn=>{
        btn.onclick=()=>viewAsset(btn.dataset.id,false);
      });
      document.querySelectorAll(".btn-edit").forEach(btn=>{
        btn.onclick=()=>viewAsset(btn.dataset.id,true);
      });
      document.querySelectorAll(".btn-delete").forEach(btn=>{
        btn.onclick=async()=>{
          const id=btn.dataset.id;
          if(!confirm("Delete this asset?"))return;
          try {
            const res=await apiFetch(`/api/assets/${id}`,{method:"DELETE"});
            if(res.ok){alert("Asset deleted");loadAssets();}
            else alert("Failed to delete asset");
          }catch(err){alert("Error deleting asset");}
        };
      });
    }

    async function viewAsset(id,editable){
      try {
        const res=await apiFetch(`/api/assets/${id}`);
        if(!res.ok) throw new Error("Failed to load asset");
        const asset=await res.json();
        currentAsset=asset;
        listSection.style.display="none";
        detailSection.style.display="block";
        formTitle.textContent=editable?`Edit Asset ${asset.id}`:`Asset ${asset.id} Details`;
        renderAssetForm(asset,editable);
      }catch(err){alert("Error loading asset details");}
    }

    function renderAssetForm(asset,editable){
      detailForm.innerHTML=`
        <div><label>Asset Tag</label><input name="asset_tag" value="${asset.asset_tag||""}" ${editable?"":"disabled"}></div>
        <div><label>Asset Type</label>
          <select name="asset_type" ${editable?"":"disabled"}>
            <option value="Laptop" ${asset.asset_type==="Laptop"?"selected":""}>Laptop</option>
            <option value="Printer" ${asset.asset_type==="Printer"?"selected":""}>Printer</option>
            <option value="Router" ${asset.asset_type==="Router"?"selected":""}>Router</option>
            <option value="Switch" ${asset.asset_type==="Switch"?"selected":""}>Switch</option>
            <option value="CCTV" ${asset.asset_type==="CCTV"?"selected":""}>CCTV</option>
            <option value="Other" ${asset.asset_type==="Other"?"selected":""}>Other</option>
          </select>
        </div>
        <div><label>Manufacturer</label><input name="manufacturer" value="${asset.manufacturer||""}" ${editable?"":"disabled"}></div>
        <div><label>Model</label><input name="model" value="${asset.model||""}" ${editable?"":"disabled"}></div>
        <div><label>Serial Number</label><input name="serial_number" value="${asset.serial_number||""}" ${editable?"":"disabled"}></div>
        <div><label>Status</label>
          <select name="status" ${editable?"":"disabled"}>
            <option value="In Stock" ${asset.status==="In Stock"?"selected":""}>In Stock</option>
            <option value="In Use" ${asset.status==="In Use"?"selected":""}>In Use</option>
            <option value="Under Repair" ${asset.status==="Under Repair"?"selected":""}>Under Repair</option>
            <option value="Disposed" ${asset.status==="Disposed"?"selected":""}>Disposed</option>
          </select>
        </div>
        <div><label>Location</label><input name="location" value="${asset.location||""}" ${editable?"":"disabled"}></div>
        <div><label>Purchase Date</label><input type="date" name="purchase_date" value="${asset.purchase_date||""}" ${editable?"":"disabled"}></div>
        <div><label>Purchase Price</label><input type="number" step="0.01" name="purchase_price" value="${asset.purchase_price||""}" ${editable?"":"disabled"}></div>
        <div style="grid-column:span 2;"><label>Notes</label><textarea name="notes" ${editable?"":"disabled"}>${asset.notes||""}</textarea></div>
      `;
      formActions.innerHTML="";
      if(editable){
        const saveBtn=document.createElement("button");
        saveBtn.className="btn btn-edit";saveBtn.textContent="Save";
        saveBtn.type="button";saveBtn.onclick=updateAsset;
        const cancelBtn=document.createElement("button");
        cancelBtn.className="btn btn-cancel";cancelBtn.textContent="Cancel";
        cancelBtn.type="button";cancelBtn.onclick=backToList;
        formActions.appendChild(saveBtn);formActions.appendChild(cancelBtn);
      }else{
        const editBtn=document.createElement("button");
        editBtn.className="btn btn-edit";editBtn.textContent="Edit";
        editBtn.type="button";editBtn.onclick=()=>renderAssetForm(asset,true);
        const cancelBtn=document.createElement("button");
        cancelBtn.className="btn btn-cancel";cancelBtn.textContent="Back";
        cancelBtn.type="button";cancelBtn.onclick=backToList;
        formActions.appendChild(editBtn);formActions.appendChild(cancelBtn);
      }
    }

    async function updateAsset(){
      const formData=new FormData(detailForm);
      const payload={};formData.forEach((v,k)=>payload[k]=v);
      try {
        const res=await apiFetch(`/api/assets/${currentAsset.id}`,{
          method:"PUT",body:JSON.stringify(payload)
        });
        if(res.ok){alert("Asset updated");backToList();loadAssets();}
        else alert("Failed to update asset");
      }catch(err){alert("Error updating asset");}
    }

    function backToList(){
      detailSection.style.display="none";
      listSection.style.display="block";
      loadAssets();
    }

    loadAssets();
    document.getElementById("search-btn").addEventListener("click", searchAssets);