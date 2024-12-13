import Table from "react-bootstrap/Table";
import { useEffect, useState } from "react";
import {fetchAllUser} from "../services/userSevice"
import ReactPaginate from 'react-paginate';
import ModalAddNew from './ModalAddNew';
import ModalEditUser from "./ModalEditUser";
import _ from "lodash";
import ModalConfirm from "./ModalConfirm";
import { toast } from 'react-toastify';

import './TableUser.scss'

import { debounce } from "lodash";
import { CSVLink, CSVDownload } from "react-csv";

import Papa from "papaparse";

const TableUsers = (props) => {

    const [listUsers,setListUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [isShowModalAddNew, setIsShowModalAddNew] = useState(false);
    const [isShowModalEdit, setIsShowModalEdit] = useState(false);
    const [dataUserEdit, setDataUserEdit] = useState({});

    const [isShowModalDelete, setIsShowModalDelete] = useState(false);
    const [dataUserDelete, setDataUserDelete] = useState({});

    const [sortBy, setSortBy] = useState("asc");
    const [sortField, setSortField] = useState("id");

    const [keyword, setKeyword] = useState('');

    const [dataExport, setDataExport] = useState([]);

    const handleClose = () => {
      setIsShowModalAddNew(false);
      setIsShowModalEdit(false);
      setIsShowModalDelete(false);
    }

    const handleUpdateTable = (user) => {
        setListUsers([user, ...listUsers])
    }

    const handleEditUserFromModal = (user) => {
        let cloneListUsers = _.cloneDeep(listUsers); 
        let index = listUsers.findIndex(item => item.id === user.id);
        cloneListUsers[index].first_name = user.first_name;
        // console.log(listUsers, cloneListUsers) //dung cloneDeep cua lodash de tro ve 2 bo nho khac nhau
        setListUsers(cloneListUsers);
    }

    useEffect(() => {
        //call apis
        getUsers(1);
        
    }, [])

    const getUsers = async (page) => {
        let res = await  fetchAllUser(page);
        console.log(">>>check new res: ", res)
        if(res && res.data) {
            setTotalUsers(res.total)
            setListUsers(res.data)
            setTotalPages(res.total_pages)
        }
    }

    const handlePageClick = (event) => {
        // console.log("event lib: ", event)
        getUsers(+event.selected + 1);
    }

    const handleEditUser = (user) => {
        // console.log(">>>>check: ", user)
        setDataUserEdit(user);
        setIsShowModalEdit(true);
    }

    const handleDeleteUser = (user) => {
        setIsShowModalDelete(true);
        setDataUserDelete(user);
    }
    
    const handleDeleteUserFromModal =(user) => {
        let cloneListUsers = _.cloneDeep(listUsers); 
        cloneListUsers = cloneListUsers.filter(item => item.id !== user.id);
        
        // console.log(listUsers, cloneListUsers) //dung cloneDeep cua lodash de tro ve 2 bo nho khac nhau
        setListUsers(cloneListUsers);
    }

    const handleSort = (sortBy, sortField) => {
        setSortBy(sortBy); 
        setSortField(sortField);
        let cloneListUsers = _.cloneDeep(listUsers); 
        cloneListUsers = _.orderBy(cloneListUsers, [sortField], [sortBy]);
        setListUsers(cloneListUsers);
    }

    const handleSearch = debounce((event) => { // dung ham debounce de sau 0.5s api moi res ket qua
        console.log(event.target.value);
        let term = event.target.value;
        if(term) {
            //đang làm phía client
            let cloneListUsers = _.cloneDeep(listUsers); 
            cloneListUsers = cloneListUsers.filter(item => item.email.includes(term))
            setListUsers(cloneListUsers);
        } else {
            getUsers(1);
        }
    }, 500)   

    const getUsersExport = (even, done) => {
        let result = [];
        if(listUsers && listUsers.length > 0) {
            result.push(["Id", "Email", "First name", "Last name"]);
            listUsers.map((item, index) => {
                let arr = [];
                arr[0] = item.id;
                arr[1] = item.email;
                arr[2] = item.first_name;
                arr[3] = item.last_name;
                result.push(arr);
            })

            setDataExport(result);
            done();
        }
    }

    const handleImportCSV = (event) => {
        if(event.target && event.target.files && event.target.files[0]){
            let file = event.target.files[0];

            if(file.type !== "text/csv"){
                toast.error("Only accept csv files...")
                return;
            }

            //Parse local CSV file
            Papa.parse(file, {
                // header: true, //chuyen tu mang sang object
                complete: function (results) {
                    let rawCSV = results.data;
                    if(rawCSV.length >0){
                        if(rawCSV[0] && rawCSV[0].length === 3){
                            if(rawCSV[0][0] !== "email"
                            ||rawCSV[0][1] !== "first_name"
                            ||rawCSV[0][2] !== "last_name"
                            ) {
                                toast.error("Wrong format Header CSV file!")
                            } else {
                                let result = [];
                                // console.log(rawCSV)

                                rawCSV.map((item, index) => {
                                    if(index >0 && item.length === 3){
                                        let obj = {};
                                        obj.email = item[0];
                                        obj.first_name = item[1];
                                        obj.last_name = item[2];
                                        result.push(obj);
                                    }
                                })
                                setListUsers(result);
                                console.log("check: ", result)
                            }
                        } else {
                            toast.error("Wrong format CSV file!")
                        }
                    } else {
                        toast.error("Not found data on CSV file!") 
                  }
                }
            });
        }
    }

    return (
        <>
            <div className="my-3 d-sm-flex justify-content-between">
                <span><b>List Users:</b></span>
                <div className="group-btns mt-sm-2 mt-2">
                    <label className="btn btn-warning" htmlFor="test">
                        <i className="fa-solid fa-file-import px-1"></i>Import
                    </label>
                    <input id="test" type="file" hidden
                        onChange={(event) => handleImportCSV(event)}
                    />
                    
                    <CSVLink 
                        filename={"users.csv"}
                        className="btn btn-primary"
                        data={dataExport}
                        asyncOnClick={true}
                        onClick={getUsersExport}
                    >
                        <i className="fa-solid fa-file-arrow-down px-1"></i>Export
                    </CSVLink>
                    <button className="btn btn-success"
                        onClick={() => setIsShowModalAddNew(true)}
                    >
                        <i className="fa-solid fa-circle-plus px-1"></i>Add new
                    </button>
                </div>
            </div>
            <div className="col-12 col-sm-4 my-3">
                <input 
                    className="form-control" 
                    placeholder="Search user by email..."
                    // value={keyword}
                    onChange={(event) => handleSearch(event)}
                />
            </div>
        
            <div className="customize-table">
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th className="align-middle">
                            <div className="sort-header">
                                <span>ID</span>
                                <span>
                                    <i 
                                        className="fa-solid fa-arrow-down-long"
                                        onClick={() => handleSort("desc", "id")}
                                    ></i>
                                    <i 
                                        className="fa-solid fa-arrow-up-long"
                                        onClick={() => handleSort("asc", "id")}
                                    ></i>
                                </span>
                            </div>
                            </th>
                            <th className="align-middle">Email</th>
                            <th className="align-middle">
                                <div className="sort-header">
                                    <span>First name</span>
                                    <span>
                                        <i 
                                            className="fa-solid fa-arrow-down-long"
                                            onClick={() => handleSort("desc", "first_name")}
                                        ></i>
                                        <i 
                                            className="fa-solid fa-arrow-up-long"
                                            onClick={() => handleSort("asc", "first_name")}
                                        ></i>
                                    </span>
                                </div>
                            </th>
                            <th className="align-middle">Last name</th>
                            <th className="align-middle">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listUsers && listUsers.length >0 && 
                        listUsers.map((item, index) => {
                            return (
                                <tr key={`users-${index}`}>
                                    <td className="align-middle">{item.id}</td>
                                    <td className="align-middle">{item.email}</td>
                                    <td className="align-middle">{item.first_name}</td>
                                    <td className="align-middle">{item.last_name}</td>
                                    <td>
                                        <button className="my-1 my-sm-0 btn btn-warning mx-3 " onClick={() => handleEditUser(item)}>Edit</button>
                                        <button className="btn btn-danger" onClick={() => handleDeleteUser(item)}>Delete</button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>
            </div>
            
            <ReactPaginate
                breakLabel="..."
                nextLabel="next >"
                onPageChange={handlePageClick}
                pageRangeDisplayed={5}
                pageCount={totalPages}
                previousLabel="< previous"

                pageClassName="page-item"
                pageLinkClassName="page-link"
                previousClassName="page-item"
                previousLinkClassName="page-link"
                nextClassName="page-item"
                nextLinkClassName="page-link"
                breakClassName="page-item"
                breakLinkClassName="page-link"
                containerClassName="pagination"
                activeClassName="active"
            />
            <ModalAddNew
                show={isShowModalAddNew}
                handleClose={handleClose}
                handleUpdateTable={handleUpdateTable}
            />
            <ModalEditUser
                show={isShowModalEdit}
                dataUserEdit={dataUserEdit}
                handleClose={handleClose}
                handleEditUserFromModal={handleEditUserFromModal}
            />
            <ModalConfirm
                show={isShowModalDelete}
                handleClose={handleClose}
                dataUserDelete={dataUserDelete}
                handleDeleteUserFromModal={handleDeleteUserFromModal}
            />
        </>
    );
};

export default TableUsers;
