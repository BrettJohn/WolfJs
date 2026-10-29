class MiddledController extends Middled {
    configurePage(obj) {
        super.configurePage(obj);
        this.titleH1 = this.h1({ html: document.title });
        this.middledCol.add(this.titleH1);
        this.controllerDropdownCss = { css: { width: '100%', borderRadius: '0 0 10px 10px' } };
        this.dropdownBtnHeightStr = '30px';
    }

    async loadController() {
        await this.checkUser();
        this.Id = Core.getUrlParam('Id');
        let row = this.row({ css: { paddingTop: '20px' } });
        this.completeBtn = this.confirmBtn({ html: 'Complete', onclick: () => { this.complete(); }});
        row.add(this.col3());
        if (this.Id) {
            row.add(
                this.col3({ css: { ...this.centerTextCss } }).add(
                    this.confirmBtn({
                        html: 'Delete',
                        onclick: () => { this.askDelete(); },
                        css: { backgroundColor: this.color13 }
                    })
                )
            );
            row.add(this.col3({ css: { ...this.centerTextCss } }).add(this.completeBtn));
        } else {
            row.add(this.col6({ css: { ...this.centerTextCss } }).add(this.completeBtn));
        }
        row.add(this.col3());
        this.middledCol.add(row);
    }

    async askDelete() {
        let deleteBtn = this.button({ html: 'Delete', css: { backgroundColor: this.color13 } });
        let cancelBtn = this.button({ html: 'Cancel' });
        cancelBtn.dataset.default = 'true';
        let popup = this.popup(this.div()
            .add(this.p({ html: 'Confirm delete?' })).add(deleteBtn).add(cancelBtn)
        ).bad();
        deleteBtn.onclick = () => {
            popup.remove();
            this.delete();
        };
        cancelBtn.onclick = () => popup.remove();
    }

    async delete() {}

    saveResult(resultObj, p = '', urlStr = 'Index.php') {
        if (p === '' && resultObj.saveResult === 'Success') {
            Core.goto(urlStr);
        } else {
            let okBtn = this.button({ html: 'OK'});
            let popup = this.popup(
                this.div()
                    .add(this.h1({ html: 'Failed to complete' }))
                    .add(this.p({ html: p || resultObj.Error || '', css: { fontSize: '15px' } }))
                    .add(okBtn)
            ).bad();
            okBtn.onclick = () => popup.remove();
        }
    }

    deleteResult(resultObj) {
        if (resultObj.deleteResult === 'Success') {
            Core.goto('Index.php');
        } else {
            let okBtn = this.button({ html: 'OK' });
            let popup = this.popup(this.div().add(this.p({ html: 'Failed to delete' })).add(okBtn)).bad();
            okBtn.onclick = () => popup.remove();
        }
    }
}
