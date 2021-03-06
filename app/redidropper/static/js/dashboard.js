// Implements the UI for displaying subject event files
//
//  Components used:
//
//      SubjectsRow
//      SubjectsTable
//      SubjectsPagination
//
//      EventsTable
//      FilesList
//      Dashboard

var SubjectsRow = React.createClass({
    getInitialState: function() {
        return {
            row_data: this.props.row_data,
            max_events: this.props.max_events
        };
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState(
                {
                    row_data: nextProps.row_data,
                    max_events: nextProps.max_events
                });
    },
    showAlert: function() {
        $("#event-alert").show();
        setTimeout(function () {
            $("#event-alert").hide();
        }, 1500);
    },
    render: function() {
        var column_count = this.state.max_events;
        var table_columns = [];
        var row_data = this.state.row_data;
        var events_count = 0;
        var i;
        /*
        var events_count = row_data.events.length;


        for(i = 0; i < events_count; i++) {
            var view_files_url = "/" + row_data.events[i].event_id;
            if (row_data.events[i].event_files !== 0) {
                table_columns.push(<td><a href={view_files_url}>{row_data.events[i].event_files}</a></td>);
            }
            else {
                table_columns.push(<td><a href={view_files_url}><i className="fa fa-lg fa-plus-circle"></i></a></td>);
            }
        }
        var new_event = "/start_upload/" + row_data.id;
        table_columns.push(<td><a href={new_event}><i className="fa fa-lg fa-plus-circle"></i></a></td>);
        */

        for (i = events_count + 2; i <= column_count; i++) {
            table_columns.push(<td><i className="fa fa-lg fa-plus-circle" onClick={this.showAlert}></i></td>);
        }

        var selectSubject = this.props.subjectSelected.bind(null, row_data);
        return (
            <tr>
                <td>
                    <button className="btn btn-lg2 btn-primary btn-block"
                        onClick={selectSubject}>
                        Select subject: {row_data.id}
                    </button>
                </td>
                {table_columns}
            </tr>
       );
    }
});


var SubjectsTable = React.createClass({

    getInitialState: function() {
        return {
            subjects: [],
            max_events: this.props.max_events,
            no_of_pages: 0
        };
    },
    changePage: function(i) {
        this.changeData(i, this.state.max_events);
    },
    changeData: function(page_num, max_events) {
        // if needed we will allow the user to select how many rows to display per page
        var per_page = 4;
        var request_data = {'per_page': per_page, 'page_num': page_num};
        var _this = this;
        var request = Utils.api_post_json("/api/list_local_subjects", request_data);

        request.success( function(json) {
            _this.setState({
                subjects: json.data.list_of_subjects,
                max_events: max_events,
                no_of_pages: json.data.total_pages
            });
        });
        request.fail(function (jqXHR, textStatus, error) {
            console.log('Failed: ' + textStatus + error);
        });
    },
    componentWillMount: function() {
        this.changeData(1, this.props.max_events);
    },
    componentWillReceiveProps: function(nextProps) {
        this.changeData(1, nextProps.max_events);
    },
    render: function() {
        var table_rows = [];
        var subjects_data = this.state.subjects;
        var row_count = subjects_data.length;
        var column_count = this.state.max_events;

        var i;
        for(i = 0; i < row_count; i++) {
            table_rows.push(<SubjectsRow
                    row_data = {subjects_data[i]}
                    max_events = {column_count}
                    subjectSelected = {this.props.subjectSelected}/>);
        }

        var table_columns = [];
        // table_columns.push(<th>Subject ID</th>);

        for (i = 1; i <= column_count; i++) {
            table_columns.push(<th> Event {i}</th>);
        }
        var pagination;
        var no_of_pages = this.state.no_of_pages;

        if (no_of_pages > 1) {
            pagination = <SubjectsPagination no_of_pages={no_of_pages} changePage={this.changePage}/>;
        }

    return (
    <div className="table-responsive">
        <div>{this.props.selected_project}</div>
        <table id="technician-table" className="table table-curved">
            <thead>
                <tr>
                    {table_columns}
                </tr>
            </thead>
            <tbody id="technician-table-body">
                {table_rows}
            </tbody>
        </table>
        {pagination}
    </div>
    );
  }
});


var EventsTable = React.createClass({
    getInitialState: function() {
        return {
            list_of_events: []
        };
    },

    componentDidMount: function() {
        $('[data-toggle="tooltip"]').tooltip()
    },

    componentWillMount: function() {
        var _this = this;
        var url = "/api/list_subject_events";
        var request_data = {subject_id: this.props.subject_id};
        var request = Utils.api_post_json(url, request_data);

        request.success( function(json) {
            _this.setState({
                list_of_events: json.data.subject_events
            });
        });
        request.fail(function (jqXHR, textStatus, error) {
            console.log('Failed: ' + textStatus + error);
        });
    },

    render: function() {
        var rows = [];
        var _this = this;

        this.state.list_of_events.map(function(record, i) {
            var eventSelected = _this.props.eventSelected.bind(null, record);
            var title = "Files: " + record.file_names;

            rows.push(
            <tr>
                <td> {i+1} </td>
                <td> {record.unique_event_name} </td>
                <td>
                    <button
                        className="btn btn-primary btn-block"
                        data-toggle="tooltip"
                        title={title}
                        onClick={eventSelected}>
                        {record.total_files}
                    </button>
                </td>
            </tr>
            );
        });

        return (
        <div>
            <div className="table-responsive">
                <table id="event-table" className="table table-striped table-curved">
                    <thead>
                        <tr>
                        </tr>
                    </thead>
                    <tbody id="subject-table-body">
                        {rows}
                    </tbody>
                </table>
            </div>
        </div>
        );
    }
});

var FilesList = React.createClass({
    getInitialState: function() {
        return {
            list_of_files :[]
        };
    },

    componentWillMount: function() {
        var _this = this;
        var request_data = {
            subject_id: this.props.subject_id.id,
            event_id: this.props.event_id.id
        };
        console.log(request_data);

        var request = Utils.api_post_json("/api/list_subject_event_files", request_data);

        request.success(function(json) {
            _this.setState({
                list_of_files: json.data.subject_event_files
            });
        });
        request.fail(function (jqXHR, textStatus, error) {
            console.log('Failed: ' + textStatus + error);
        });
    },
    render: function() {
        return (
        <div className="table-responsive" >
            <table id="technician-table" className="table table-striped">
                <thead>
                    <tr>
                        <th className="text-center"> # </th>
                        <th className="text-center"> File Name </th>
                        <th className="text-center"> File Size </th>
                        <th className="text-center"> Uploaded </th>
                        <th className="text-center"> Uploaded By </th>
                        <th className="text-center"></th>
                    </tr>
                </thead>
                <tbody id="technician-table-body">
                {
                this.state.list_of_files.map(function(record, i) {
                    var uploaded_at = record.uploaded_at[0] + " " + record.uploaded_at[1];
                    var download_url = "/api/download_file?file_id=" + record.id;

                    return <tr>
                        <td> {i+1} </td>
                        <td>{record.file_name}</td>
                        <td>{record.file_size}</td>
                        <td>{uploaded_at}</td>
                        <td>{record.user_name}</td>
                        <td><a href={download_url} className="btn btn-primary">Download File</a></td>
                    </tr>
                })}
                </tbody>
            </table>
        </div>
        );
    }
});

var SubjectsPagination = React.createClass({
    getInitialState: function() {
        return {
            no_of_pages: this.props.no_of_pages,
            current_page: 1
        };
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState({
            no_of_pages: nextProps.no_of_pages,
            current_page: this.state.current_page
        });
    },
    activateOnClick: function(i) {
        this.setState({
            no_of_pages: this.state.no_of_pages,
            current_page: i
        });
        this.props.changePage(i);
    },
    nextPage: function() {
        var current_page = this.state.current_page;
        if (current_page === this.state.no_of_pages) {
            return;
        }
        else {
            this.setState({
                no_of_pages: this.state.no_of_pages,
                current_page: current_page+1
            });
            this.props.changePage(current_page + 1);
        }
    },
    prevPage: function() {
        var current_page = this.state.current_page;
        if (current_page === 1) {
            return;
        }
        else {
            this.setState({
                no_of_pages: this.state.no_of_pages,
                current_page: current_page - 1
            });
            this.props.changePage(current_page-1);
        }
    },
    render: function() {
        var pages = [];

        for(var i = 1; i <= this.state.no_of_pages; i++) {
            if(i === this.state.current_page) {
                pages.push(<li className="active"><a>{i}</a></li>);
            }
            else {
                pages.push(<li><a onClick={this.activateOnClick.bind(null, i)}>{i}</a></li>);
            }
        }
        return (
        <nav>
          <ul className="pagination">
            <li>
              <a onClick={this.prevPage} aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
              </a>
            </li>
            {pages}
            <li>
              <a onClick={this.nextPage} aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
              </a>
            </li>
          </ul>
        </nav>
        );
    }
});


var Dashboard = React.createClass({
        getInitialState: function() {
        //Add Listner for the url change
        window.onhashchange = this.urlChanged;

        var tabs = [
            "Subjects",
            "Subject Events",
            "Subject Event Files"
        ];
        return {
            current_tab: 0,
            tabs: tabs,
            subject_id: "",
            event_id: ""
        };
    },
    changeTab: function(i) {
        this.setState({
            current_tab: i
        });
    },
    subjectSelected: function(subject_id) {
        this.setState({
            current_tab: 1,
            subject_id: subject_id
        });
    },
    eventSelected: function(event_id) {
        this.setState({
            current_tab: 2,
            event_id: event_id
        });
    },
    showFiles: function() {
        this.setState({
            current_tab: 3
        });
    },

    urlChanged: function() {
      var hash_value = location.hash;
      var current_tab = this.state.current_tab;

      //check whether the current state is not equal to hash value
      if("#"+this.state.tabs[current_tab] !== hash_value) {

        // State has to be changed
        if(hash_value === "#Subjects") {
          this.setState({
              current_tab: 0,
              event_id: ""
          });
        }
        else if (hash_value === "#Events" && this.state.current_tab === 2) {
          // The condition 'this.state.current_tab==2' is to avoid
          // state changes for forward button click from subjects tab
          this.setState({current_tab: 1});
        }
      }
    },
    render: function() {
        var visible_tab,
            selected_subject_id,
            selected_event_id;
        var breadcrumbs = [];
        var current_tab = this.state.current_tab;
        var tabs = this.state.tabs;

        if(this.state.subject_id !== "") {
            selected_subject_id = "Subject ID: " + this.state.subject_id.id;
        }
        if(this.state.event_id !== "") {
            selected_event_id = "Event ID: " + this.state.event_id.unique_event_name;
        }

        for(var i = 0; i < tabs.length; i++) {
            var tab_class;
            if(current_tab === i) {
                breadcrumbs.push(<li><a>{tabs[i]}</a></li>);
            }
            else if(current_tab > i) {
                breadcrumbs.push(
                        <li className="prev-page" onClick={this.changeTab.bind(null, i)}>
                        <a>{tabs[i]}</a>
                        </li>);
            }
            else if(current_tab < i) {
                breadcrumbs.push(<li className="next-page"><a>{tabs[i]}</a></li>);
            }
        }

        $("#upload-files").hide();
        $("#upload-complete-button").hide();

        if (current_tab === 0) {
            window.location.hash = 'Subjects';
            visible_tab = <SubjectsTable subjectSelected = {this.subjectSelected} />;
        }
        else if (current_tab === 1) {
            window.location.hash = 'Events';
            visible_tab = <EventsTable subject_id = {this.state.subject_id} eventSelected = {this.eventSelected}/>;
        }
        else if (current_tab === 2) {
            window.location.hash = 'Files';
            visible_tab = <FilesList subject_id = {this.state.subject_id} event_id = {this.state.event_id}/>;
        }

        return (
            <div>
                <div className="panel-heading">
                    <div id="crumbs">
                        <ul>
                            {breadcrumbs}
                        </ul>
                    </div>
                </div>
                <div className="row">
                <div className="col-md-offset-4 col-md-4 col-xs-12">
                <table id="technician-table" className="table table-striped">
                    <thead>
                    <tr>
                        <th>{selected_subject_id}</th>
                        <th>{selected_event_id}</th>
                     </tr>
                </thead>
                </table>
                </div>
                </div>
                <div className="panel-body">
                    {visible_tab}
                </div>
            </div>
        );
    }
});

React.render(<Dashboard/>, document.getElementById("dashboard"));
